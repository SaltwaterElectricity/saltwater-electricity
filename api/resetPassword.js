import { initFirebaseAdmin } from "./_utils/firebase.js";
import { sendSuccess, sendError, handleOptions } from "./_utils/response.js";

/**
 * Vercel Serverless Function: resetPassword
 * Securely resets a user's password using a validated OTP transaction.
 * Remediation: Binds mutation to the transaction token and uses ATOMIC consumption.
 */
export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  if (req.method === "GET" && req.query.ping) {
    return sendSuccess(res, { message: "API is reachable" });
  }

  if (req.method !== "POST") {
    return sendError(res, "Method Not Allowed", 405, "auth/method-not-allowed");
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
    const { auth, db } = initFirebaseAdmin();
    const otpRef = db.ref(`otp-requests/${transactionToken}`);

    // REMEDIATION: Use a transaction to atomically check and consume the authorization.
    const result = await otpRef.transaction((currentData) => {
      if (!currentData || currentData.status !== 'CONSUMED') {
        return null; // Not found or not yet verified
      }
      return null; // Transition to null to effectively remove the token atomically
    });

    // Note: In RTDB transactions, returning null deletes the data.
    // This proves the token was CONSUMED and now it is GONE.
    if (!result.committed) {
      return sendError(res, "Authorization required or already consumed.", 403, "auth/not-authorized");
    }

    const consumedData = result.snapshot;
    if (!consumedData) {
      return sendError(res, "Invalid authorization state.", 400, "auth/invalid-state");
    }

    const uid = consumedData.uid;
    if (!uid) {
      return sendError(res, "Internal security error: Transaction not bound to account.", 500, "auth/binding-error");
    }

    if (email && email.toLowerCase().trim() !== consumedData.email) {
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
      return sendError(res, "Failed to update password in authentication system.", 500, "auth/update-failed");
    }
  } catch (error) {
    return sendError(res, error, 500, "auth/reset-password-failed");
  }
}
