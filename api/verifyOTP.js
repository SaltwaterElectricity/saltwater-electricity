import { initFirebaseAdmin } from "./_utils/firebase.js";
import { sendSuccess, sendError, handleOptions } from "./_utils/response.js";

export default async function handler(req, res) {
  console.error("[verifyOTP] handler-entered");
  if (handleOptions(req, res)) return;
  
  const { transactionToken, code } = req.body;
  console.error(`[verifyOTP] request-params: token=${!!transactionToken}, code=${!!code}`);

  if (!transactionToken || !code) {
    return sendError(res, "Missing transactionToken or code.", 400, "auth/missing-parameters");
  }

  try {
    const { db } = initFirebaseAdmin();
    console.error("[verifyOTP] firebase-init-success");
    
    const otpRef = db.ref(`otp-requests/${transactionToken}`);

    const result = await otpRef.transaction((currentData) => {
      if (!currentData) return null;

      // 1. Check if already consumed or invalidated
      if (currentData.status !== "ACTIVE") return null;

      // 2. Check expiration
      if (Date.now() > currentData.expiresAt) {
        return { ...currentData, status: "INVALIDATED" };
      }

      // 3. Check attempt limits (max 5 attempts)
      if ((currentData.attempts || 0) >= 5) {
        return { ...currentData, status: "INVALIDATED" };
      }

      // 4. Verify code
      if (currentData.code !== code) {
        return { ...currentData, attempts: (currentData.attempts || 0) + 1 };
      }

      // 5. Success: Mark as CONSUMED
      return { ...currentData, status: "CONSUMED" };
    });

    if (!result.committed || !result.snapshot) {
      console.error("[verifyOTP] transaction-failed-or-not-found");
      return sendError(res, "Authorization failed or record not found.", 400, "auth/invalid-token");
    }

    const snapshot = result.snapshot;
    console.error(`[verifyOTP] snapshot-status: ${snapshot.status}`);

    if (snapshot.status === "CONSUMED") {
      console.error("[verifyOTP] code-comparison-success");
      console.error("[verifyOTP] transaction-consumed");
      return sendSuccess(res, { verified: true });
    }

    if (snapshot.status === "INVALIDATED") {
      console.error("[verifyOTP] token-invalidated");
      return sendError(res, "OTP has expired or too many failed attempts.", 400, "auth/otp-invalidated");
    }

    console.error("[verifyOTP] code-comparison-failed");
    return sendError(res, "Invalid verification code.", 400, "auth/invalid-code");
  } catch (e) {
    console.error(`[verifyOTP] Internal Error: ${e.message}`);
    return sendError(res, e, 500, "auth/verify-failed");
  }
}
