import { initFirebaseAdmin } from "./_utils/firebase.js";
import { sendSuccess, sendError, handleOptions } from "./_utils/response.js";

/**
 * Vercel Serverless Function: verifyOTP
 * Securely verifies an OTP for password reset (Step 2).
 */
export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  if (req.method === "GET" && req.query.ping) {
    return sendSuccess(res, { message: "API is reachable" });
  }

  if (req.method !== "POST") {
    return sendError(res, "Method Not Allowed", 405, "otp/method-not-allowed");
  }

  const { trackingId, code, shouldDelete = false } = req.body;

  if (!trackingId || !code) {
    return sendError(res, "Missing trackingId or code.", 400, "otp/missing-parameters");
  }

  try {
    const { db } = initFirebaseAdmin();
    const otpRef = db.ref(`otp-requests/${trackingId}`);
    const snapshot = await otpRef.once("value");

    if (!snapshot.exists()) {
      return sendError(res, "No active security code found.", 400, "otp/not-found");
    }

    const data = snapshot.val();
    const isExpired = Date.now() > data.expiresAt;
    const isMatch = data.code === code.toString().trim();

    if (isExpired) {
      await otpRef.remove();
      return sendError(res, "This security code has expired.", 400, "otp/expired");
    }

    if (!isMatch) {
      return sendError(res, "Invalid security code.", 400, "otp/invalid-code");
    }

    // Extend expiration by 5 minutes to allow time for the "Set Password" step
    const EXTENSION_MS = 300000; // 5 minutes
    await otpRef.update({
      expiresAt: Date.now() + EXTENSION_MS,
    });

    if (shouldDelete) {
      await otpRef.remove();
    }

    return sendSuccess(res, { verified: true, email: data.email });
  } catch (error) {
    return sendError(res, error, 500, "otp/verification-failed");
  }
}
