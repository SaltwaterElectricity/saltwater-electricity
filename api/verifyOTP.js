import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

/**
 * Vercel Serverless Function: verifyOTP
 *
 * Securely verifies an OTP for password reset.
 * Used for frontend UX validation (Step 2) before the actual reset.
 */

export default async function handler(req, res) {
  // 1. Diagnostic Ping
  if (req.query.ping) {
    return res.status(200).json({ status: "ok", message: "API is reachable" });
  }

  // 2. CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { trackingId, code, shouldDelete = false } = req.body;

  if (!trackingId || !code) {
    return res.status(400).json({ error: "Missing trackingId or code." });
  }

  try {
    // 3. Modular Initialization
    if (!getApps().length) {
      const project_id = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
      const client_email = process.env.FIREBASE_CLIENT_EMAIL;
      const private_key = process.env.FIREBASE_PRIVATE_KEY;

      if (!project_id || !client_email || !private_key) {
        throw new Error(
          "Missing Firebase Admin credentials (PROJECT_ID, CLIENT_EMAIL, or PRIVATE_KEY)."
        );
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
    const otpRef = db.ref(`otp-requests/${trackingId}`);
    const snapshot = await otpRef.once("value");

    if (!snapshot.exists()) {
      return res
        .status(400)
        .json({ error: "No active security code found.", code: "otp/not-found" });
    }

    const data = snapshot.val();
    const isExpired = Date.now() > data.expiresAt;
    const isMatch = data.code === code.toString().trim();

    if (isExpired) {
      await otpRef.remove();
      return res
        .status(400)
        .json({ error: "This security code has expired.", code: "otp/expired" });
    }

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid security code.", code: "otp/invalid-code" });
    }

    if (shouldDelete) {
      await otpRef.remove();
    }

    return res.status(200).json({ verified: true, email: data.email });
  } catch (error) {
    console.error("Verify OTP API Error:", error.message);
    return res.status(500).json({
      error: "Verification failed.",
      details: error.message,
    });
  }
}
