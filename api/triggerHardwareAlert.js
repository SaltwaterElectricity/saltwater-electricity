import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import axios from "axios";

/**
 * Vercel Serverless Function: triggerHardwareAlert
 *
 * Optimized for ESP32 calls.
 * Accepts deviceId and tdsValue, finds the owner, and sends an SMS.
 */

export default async function handler(req, res) {
  // 1. Security: Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 2. Input Sanitization & Extraction
  const deviceId = req.body.deviceId
    ?.toString()
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "");
  const tdsValue = parseFloat(req.body.tdsValue);
  const secretKey = req.body.secretKey;

  // 3. Strict Authentication: NO DEFAULT SECRET
  const HARDWARE_SECRET = process.env.HARDWARE_SECRET_KEY;

  if (!HARDWARE_SECRET) {
    console.error("CRITICAL: HARDWARE_SECRET_KEY environment variable is missing.");
    return res.status(500).json({ error: "Server configuration error." });
  }

  if (secretKey !== HARDWARE_SECRET) {
    console.warn(
      `[SECURITY] Unauthorized hardware alert attempt. Device: ${deviceId || "Unknown"}`
    );
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!deviceId || isNaN(tdsValue)) {
    return res.status(400).json({ error: "Invalid deviceId or tdsValue." });
  }

  try {
    // 4. Initialize Firebase Admin
    if (!getApps().length) {
      const project_id = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
      const client_email = process.env.FIREBASE_CLIENT_EMAIL;
      const private_key = process.env.FIREBASE_PRIVATE_KEY;

      if (!project_id || !client_email || !private_key) {
        console.error(
          "Missing Firebase Admin credentials (PROJECT_ID, CLIENT_EMAIL, or PRIVATE_KEY)."
        );
        throw new Error("Server configuration error: Missing Firebase credentials.");
      }

      initializeApp({
        credential: cert({
          project_id,
          client_email,
          private_key: private_key.replace(/\\n/g, "\n"),
        }),
        databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
      });
    }

    const db = getDatabase();

    // 5. ANTI-SPAM PROTECTION: 15-Minute Cooldown per Device
    const alertMetaRef = db.ref(`system_metadata/alerts/${deviceId}`);
    const metaSnap = await alertMetaRef.get();
    const now = Date.now();
    const COOLDOWN_MS = 15 * 60 * 1000; // 15 Minutes

    if (metaSnap.exists()) {
      const lastSent = metaSnap.val().lastSmsSent || 0;
      if (now - lastSent < COOLDOWN_MS) {
        const remaining = Math.ceil((COOLDOWN_MS - (now - lastSent)) / 60000);
        return res.status(429).json({
          error: "Rate limit exceeded",
          message: `SMS alert already sent recently. Cooldown active for ${remaining} more minutes.`,
        });
      }
    }

    // 6. Data Lookup: Find Owner & Mobile Number
    const assignmentRef = db.ref(`device_assignments/${deviceId}`);
    const assignmentSnap = await assignmentRef.get();

    if (!assignmentSnap.exists()) {
      return res.status(404).json({ error: "Device not assigned to any user." });
    }

    const { userId } = assignmentSnap.val();
    const userSnap = await db.ref(`users/${userId}`).get();

    if (!userSnap.exists() || !userSnap.val().mobileNum || userSnap.val().mobileNum === "N/A") {
      return res.status(404).json({ error: "No valid mobile number found for device owner." });
    }

    const mobileNum = userSnap.val().mobileNum;

    // 7. Trigger Semaphore SMS
    const apiKey = process.env.SEMAPHORE_API_KEY;
    const senderName = process.env.SEMAPHORE_SENDER_NAME || "SEMAPHORE";

    const message = `[SALT-ELEC] ALERT: Unit ${deviceId} detected critical TDS levels: ${tdsValue} PPM. Check dashboard now.`;

    const smsResponse = await axios.post("https://api.semaphore.co/api/v4/messages", {
      apikey: apiKey,
      number: mobileNum,
      message: message,
      sendername: senderName,
    });

    // 8. Update Cooldown Timestamp
    await alertMetaRef.set({
      lastSmsSent: now,
      lastTdsValue: tdsValue,
      status: "delivered",
    });

    return res.status(200).json({
      success: true,
      message: "Alert delivered.",
      message_id: smsResponse.data[0]?.message_id,
    });
  } catch (error) {
    // Detailed logging for debugging
    console.error(`[Hardware Alert Error] Device: ${deviceId}:`, {
      message: error.message,
      stack: error.stack,
      code: error.code,
      response: error.response?.data, // If it's an axios error
    });

    return res.status(500).json({
      error: "Failed to process alert.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
