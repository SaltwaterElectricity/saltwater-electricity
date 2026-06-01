import { initFirebaseAdmin } from "./_utils/firebase.js";
import { sendSuccess, sendError, handleOptions } from "./_utils/response.js";
import axios from "axios";

/**
 * Vercel Serverless Function: sendSMS
 * Securely triggers PhilSMS alerts from the backend.
 */
export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    return sendError(res, "Method Not Allowed", 405, "sms/method-not-allowed");
  }

  // 🛡️ SECURITY: Verify Firebase ID Token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "Unauthorized", 401, "sms/unauthorized");
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const { auth } = initFirebaseAdmin();
    await auth.verifyIdToken(idToken);

    const apiToken = process.env.PHILSMS_API_TOKEN;
    const senderId = process.env.PHILSMS_SENDER_ID || "PhilSMS";

    if (!apiToken) {
      console.error("[sendSMS] Missing PhilSMS configuration.");
      return sendError(res, "SMS service configuration missing.", 500, "sms/config-missing");
    }

    let { number, message } = req.body;

    if (!number || !message) {
      return sendError(
        res,
        "Missing recipient number or message content.",
        400,
        "sms/missing-fields"
      );
    }

    // Format number for PhilSMS (ensure 639... format)
    let formattedNumber = number
      .toString()
      .trim()
      .replace(/[^0-9]/g, "");
    if (formattedNumber.startsWith("09")) {
      formattedNumber = "63" + formattedNumber.substring(1);
    } else if (formattedNumber.startsWith("9") && formattedNumber.length === 10) {
      formattedNumber = "63" + formattedNumber;
    }

    const response = await axios.post(
      "https://dashboard.philsms.com/api/v3/sms/send",
      {
        recipient: formattedNumber,
        sender_id: senderId,
        type: "plain",
        message: message,
      },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    return sendSuccess(res, { data: response.data });
  } catch (error) {
    if (error.code === "auth/id-token-expired") {
      return sendError(res, "Session expired.", 401, "sms/token-expired");
    }
    return sendError(res, error, 500, "sms/delivery-failed");
  }
}
