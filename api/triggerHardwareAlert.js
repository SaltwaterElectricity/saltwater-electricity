import { initFirebaseAdmin } from "./_utils/firebase.js";
import { sendSuccess, sendError, handleOptions } from "./_utils/response.js";

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

  if (!deviceId || isNaN(tdsValue) || !secretKey) {
    return sendError(res, "Invalid deviceId, secretKey, or tdsValue.", 400, "hw/invalid-input");
  }

  try {
    const { db } = initFirebaseAdmin();

    // 2. Dynamic Hardware Token Authentication (Device Isolation)
    const deviceRef = db.ref(`device_information/${deviceId}`);
    const deviceSnap = await deviceRef.get();

    if (!deviceSnap.exists()) {
      return sendError(res, "Device not registered.", 404, "hw/unregistered");
    }

    const registeredToken = deviceSnap.val().token;
    if (!registeredToken) {
      console.error(`[SECURITY] Telemetry alert blocked. No token configured for device: ${deviceId}`);
      return sendError(res, "Device security token configuration missing.", 500, "hw/config-missing");
    }

    if (secretKey !== registeredToken) {
      console.warn(`[SECURITY] Unauthorized alert attempt for Device: ${deviceId}`);
      return sendError(res, "Unauthorized", 401, "hw/unauthorized");
    }

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

    // Format number for SMS (ensure 639... format)
    let formattedNumber = mobileNum
      .toString()
      .trim()
      .replace(/[^0-9]/g, "");
    if (formattedNumber.startsWith("09")) {
      formattedNumber = "63" + formattedNumber.substring(1);
    } else if (formattedNumber.startsWith("9") && formattedNumber.length === 10) {
      formattedNumber = "63" + formattedNumber;
    }

    // 5. Dispatch to Private SMS Gateway Queue (CENTRALIZED PROTOCOL)
    // All SMS alerts are routed to a single designated master device (gatewayUid).
    const MASTER_GATEWAY_UID = process.env.MASTER_GATEWAY_UID;

    if (!MASTER_GATEWAY_UID) {
      console.error("[triggerHardwareAlert] MASTER_GATEWAY_UID not configured in environment.");
      return sendError(res, "SMS Gateway configuration error.", 500, "hw/gateway-missing");
    }

    const smsQueueRef = db.ref("sms_queue");
    const message = `[SALT-ELEC] ALERT: Unit ${deviceId} detected critical TDS levels: ${tdsValue} PPM. Check dashboard now.`;

    const queueEntry = {
      number: formattedNumber,
      message: message,
      deviceId: deviceId,
      gatewayUid: MASTER_GATEWAY_UID, // Route all messages to the master device
      status: "pending",
      createdAt: now,
    };

    const newSmsRef = await smsQueueRef.push(queueEntry);

    // 6. Dispatch In-App Notifications (Unified Protocol)
    const notificationRef = db.ref("notifications");
    const alertTitle = "CRITICAL: Salinity Alert";
    const alertMessage = `Unit ${deviceId} detected critical high TDS levels: ${tdsValue} PPM. Check dashboard now.`;

    const notificationData = {
      title: alertTitle,
      message: alertMessage,
      type: "critical",
      isRead: false,
      timestamp: now,
    };

    // Notify Owner
    await notificationRef.child(userId).push(notificationData);

    // Mirror to Admin
    await notificationRef.child("admin").push({
      ...notificationData,
      title: `${alertTitle} (${deviceId})`,
    });

    // 7. Update Metadata
    await alertMetaRef.set({
      lastSmsSent: now,
      lastTdsValue: tdsValue,
      status: "queued",
      smsQueueId: newSmsRef.key,
    });

    return sendSuccess(res, { message: "Alert queued for private gateway dispatch." });
  } catch (error) {
    return sendError(res, error, 500, "hw/process-failed");
  }
}
