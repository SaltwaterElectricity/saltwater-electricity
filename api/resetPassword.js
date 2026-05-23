import { initFirebaseAdmin } from "./_utils/firebase.js";
import { sendSuccess, sendError, handleOptions } from "./_utils/response.js";

/**
 * Vercel Serverless Function: resetPassword
 * Securely resets a user's password using a verified OTP.
 */
export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  if (req.method === "GET" && req.query.ping) {
    return sendSuccess(res, { message: "API is reachable" });
  }

  if (req.method !== "POST") {
    return sendError(res, "Method Not Allowed", 405, "auth/method-not-allowed");
  }

  const { email, newPassword, otp } = req.body;

  if (!email || !newPassword || !otp) {
    return sendError(res, "Missing required parameters (email, newPassword, otp).", 400, "auth/missing-parameters");
  }

  if (newPassword.length < 8) {
    return sendError(res, "Security Check: Password must be at least 8 characters.", 400, "auth/weak-password");
  }

  try {
    const { auth, db } = initFirebaseAdmin();

    const trackingId = email
      .toLowerCase()
      .trim()
      .replace(/[^a-zA-Z0-9]/g, "");
    const otpRef = db.ref(`otp-requests/${trackingId}`);
    const snapshot = await otpRef.once("value");

    // EPP: Opaque error messages
    if (!snapshot.exists()) {
      return sendError(res, "Invalid security code or account.", 400, "auth/invalid-request");
    }

    const data = snapshot.val();
    if (Date.now() > data.expiresAt) {
      await otpRef.remove();
      return sendError(res, "The security code has expired.", 400, "auth/otp-expired");
    }

    if (data.code !== otp.toString().trim()) {
      return sendError(res, "Invalid security code.", 400, "auth/invalid-otp");
    }

    try {
      const userRecord = await auth.getUserByEmail(email);
      const uid = userRecord.uid;

      await auth.updateUser(uid, { password: newPassword });
      await db.ref(`accounts/${uid}`).update({
        requiresPasswordChange: false,
        updatedAt: new Date().toISOString(),
      });

      await otpRef.remove();
      return sendSuccess(res, { message: "Password has been reset successfully." });
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        return sendError(res, "Invalid security code or account.", 400, "auth/invalid-request");
      }
      throw error;
    }
  } catch (error) {
    return sendError(res, error, 500, "auth/reset-password-failed");
  }
}
