import { initFirebaseAdmin } from "./_utils/firebase.js";
import { sendSuccess, sendError, handleOptions } from "./_utils/response.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  const { transactionToken, code } = req.body;
  try {
    const { db } = initFirebaseAdmin();
    const otpRef = db.ref(`otp-requests/${transactionToken}`);
    const result = await otpRef.transaction((currentData) => {
      if (!currentData || currentData.status !== 'ACTIVE') return null;
      if (currentData.code !== code) return { ...currentData, attempts: (currentData.attempts || 0) + 1 };
      return { ...currentData, status: 'CONSUMED' };
    });
    if (!result.committed || !result.snapshot) return sendError(res, "Error", 400, "err");
    if (result.snapshot.status === 'CONSUMED') return sendSuccess(res, { verified: true });
    return sendError(res, "Invalid", 400, "inv");
  } catch (e) { return sendError(res, e, 500, "fail"); }
}
