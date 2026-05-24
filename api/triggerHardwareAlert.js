import { initFirebaseAdmin } from "./_utils/firebase.js";
import { sendSuccess, sendError, handleOptions } from "./_utils/response.js";
import axios from "axios";

/**
 * Vercel Serverless Function: triggerHardwareAlert
 * Optimized for ESP32 hardware calls.
 */
export default async function handler(req, res) {
  // ESP32 usually doesn't do OPTIONS, but good for testing/web calls
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    return sendError(res, "Method Not Allowed", 405, "hw/method-not-allowed");
  }

  // 1. Input Sanitization
  const deviceId = req.body.deviceId
    ?.toString()
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "");
  const tdsValue = parseFloat(req.body.tdsValue);
  const secretKey = req.body.secretKey;

  // 2. Strict Authentication
  const HARDWARE_SECRET = process.env.HARDWARE_SECRET_KEY;
  if (!HARDWARE_SECRET) {
    return sendError(res, "Server configuration error.", 500, "hw/config-missing");
  }

  if (secretKey !== HARDWARE_SECRET) {
    console.warn(
      `[SECURITY] Unauthorized hardware alert attempt. Device: ${deviceId || "Unknown"}`
    );
    return sendError(res, "Unauthorized", 401, "hw/unauthorized");
  }

  if (!deviceId || isNaN(tdsValue)) {
    return sendError(res, "Invalid deviceId or tdsValue.", 400, "hw/invalid-input");
  }

  try {
    const { db } = initFirebaseAdmin();

    // 3. Anti-Spam / Rate Limiting (15-Minute Cooldown)
    const alertMetaRef = db.ref(`system_metadata/alerts/${deviceId}`);
    const metaSnap = await alertMetaRef.get();
    const now = Date.now();
    const COOLDOWN_MS = 15 * 60 * 1000;

    if (metaSnap.exists()) {
      const lastSent = metaSnap.val().lastSmsSent || 0;
      if (now - lastSent < COOLDOWN_MS) {
        const remaining = Math.ceil((COOLDOWN_MS - (now - lastSent)) / 60000);
        return sendError(
          res,
          `Rate limit exceeded. Cooldown active for ${remaining} minutes.`,
          429,
          "hw/rate-limit"
        );
      }
    }

    // 4. Data Lookup: Find Owner
    const assignmentRef = db.ref(`device_assignments/${deviceId}`);
    const assignmentSnap = await assignmentRef.get();

    if (!assignmentSnap.exists()) {
      return sendError(res, "Device not assigned to any user.", 404, "hw/unassigned");
    }

    const { userId } = assignmentSnap.val();
    const userSnap = await db.ref(`users/${userId}`).get();

    if (!userSnap.exists() || !userSnap.val().mobileNum || userSnap.val().mobileNum === "N/A") {
      return sendError(
        res,
        "No valid mobile number found for device owner.",
        404,
        "hw/missing-contact"
      );
    }

    const mobileNum = userSnap.val().mobileNum;

    // 5. Trigger PhilSMS
    const apiToken = process.env.PHILSMS_API_TOKEN;
    const senderId = process.env.PHILSMS_SENDER_ID || "PhilSMS";

    if (!apiToken) {
      throw new Error("SMS service configuration error (missing token).");
    }

    const message = `[SALT-ELEC] ALERT: Unit ${deviceId} detected critical TDS levels: ${tdsValue} PPM. Check dashboard now.`;

    const smsResponse = await axios.post(
      "https://api.philsms.com/v3/sms/send",
      {
        recipient: mobileNum,
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

    // 6. Update Metadata
    await alertMetaRef.set({
      lastSmsSent: now,
      lastTdsValue: tdsValue,
      status: "delivered",
      smsUid: smsResponse.data.data?.id || smsResponse.data.data?.uid || smsResponse.data.message_id,
    });

    return sendSuccess(res, { message: "Alert delivered." });
  } catch (error) {
    return sendError(res, error, 500, "hw/process-failed");
  }
}
