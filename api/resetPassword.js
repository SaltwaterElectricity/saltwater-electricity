import { initFirebaseAdmin } from "./_utils/firebase.js";
import { sendSuccess, sendError, handleOptions } from "./_utils/response.js";
import { enforceAccountSecurity } from "./_utils/security.js";

/**
 * Vercel Serverless Function: resetPassword
 * Securely resets a user's password using a validated OTP transaction.
 * Remediation: Binds mutation to the transaction token and uses ATOMIC state transition.
 */
export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  if (req.method === "GET" && req.query.ping) {
    return sendSuccess(res, { message: "API is reachable" });
  }

  if (req.method !== "POST") {
    return sendError(res, "Method Not Allowed", 405, "auth/method-not-allowed");
  }

  // Authoritative Account Security Enforcement
  // Exception: skipPasswordCheck=true because this IS the password remediation endpoint.
  const { auth, db } = initFirebaseAdmin();
  const security = await enforceAccountSecurity(req, res, { auth, db }, { skipPasswordCheck: true });

  if (!security.authorized) {
    return sendError(res, security.message || "Unauthorized", security.status, security.code);
  }

  const { transactionToken, newPassword, email } = req.body;

  if (!transactionToken || !newPassword) {
    return sendError(
      res,
      "Missing required parameters (transactionToken, newPassword).",
      400,
      "auth/missing-parameters"
    );
  }

  if (newPassword.length < 8) {
    return sendError(
      res,
      "Security Check: Password must be at least 8 characters.",
      400,
      "auth/weak-password"
    );
  }

  try {
    const otpRef = db.ref(`otp-requests/${transactionToken}`);

    // ATOMIC STATE TRANSITION: CONSUMED -> RESET_COMPLETED
    // This ensures exactly-once authorization and prevents replay.
    const result = await otpRef.transaction((currentData) => {
      if (!currentData || currentData.status !== "CONSUMED") {
        return null; // Abort: Not found or not verified
      }
      return { ...currentData, status: "RESET_COMPLETED" };
    });

    const snapshot = result.snapshot ? result.snapshot.val() : null;

    // Authorization check: Must be committed AND transition to RESET_COMPLETED
    if (!result.committed || !snapshot || snapshot.status !== "RESET_COMPLETED") {
      return sendError(
        res,
        "Authorization required or already consumed.",
        403,
        "auth/not-authorized"
      );
    }

    // Authoritative UID binding from server-side state
    const uid = snapshot.uid;
    if (!uid) {
      return sendError(
        res,
        "Internal security error: Transaction not bound to account.",
        500,
        "auth/binding-error"
      );
    }

    if (email && email.toLowerCase().trim() !== snapshot.email) {
      return sendError(res, "Account mismatch.", 400, "auth/mismatch");
    }

    try {
      await auth.updateUser(uid, { password: newPassword });

      await db.ref(`accounts/${uid}`).update({
        requiresPasswordChange: false,
        updatedAt: new Date().toISOString(),
      });

      return sendSuccess(res, { message: "Password has been reset successfully." });
    } catch (error) {
      console.error(`[resetPassword] Admin SDK error: ${error.message}`);
      return sendError(
        res,
        "Failed to update password in authentication system.",
        500,
        "auth/update-failed"
      );
    }
  } catch (error) {
    return sendError(res, error, 500, "auth/reset-password-failed");
  }
}
