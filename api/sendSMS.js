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

  const apiToken = process.env.PHILSMS_API_TOKEN;
  const senderId = process.env.PHILSMS_SENDER_ID || "PhilSMS";

  if (!apiToken) {
    return sendError(res, "SMS service unavailable.", 500, "sms/config-missing");
  }

  try {
    const { number, message } = req.body;

    if (!number || !message) {
      return sendError(
        res,
        "Missing recipient number or message content.",
        400,
        "sms/missing-fields"
      );
    }

    const response = await axios.post(
      "https://api.philsms.com/api/v3/send-sms",
      {
        recipient: number,
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
    return sendError(res, error, 500, "sms/delivery-failed");
  }
}
