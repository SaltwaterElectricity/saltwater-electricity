import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";

/**
 * Vercel Serverless Function: resetPassword
 * 
 * Securely resets a user's password using a verified OTP.
 * Uses Firebase Admin SDK to perform administrative updates.
 */

export default async function handler(req, res) {
  // 1. Diagnostic Ping
  if (req.query.ping) {
    return res.status(200).json({ status: "ok", message: "API is reachable" });
  }

  // 2. CORS Configuration
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { email, newPassword, otp } = req.body;

  if (!email || !newPassword || !otp) {
    return res.status(400).json({ error: "Missing required parameters (email, newPassword, otp)." });
  }

  // 🛡️ SECURITY: Basic complexity check
  if (newPassword.length < 8) {
    return res.status(400).json({ 
      error: "Security Check: Password must be at least 8 characters.",
      code: "auth/weak-password" 
    });
  }

  try {
    // 3. Modular Initialization
    if (!getApps().length) {
      const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;

      if (!projectId || !clientEmail || !privateKey) {
        throw new Error("Missing Firebase Admin credentials (PROJECT_ID, CLIENT_EMAIL, or PRIVATE_KEY).");
      }

      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n"),
        }),
        databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
      });
    }

    const auth = getAuth();
    const db = getDatabase();

    // 4. Logic Execution
    const userRecord = await auth.getUserByEmail(email);
    const uid = userRecord.uid;

    const trackingId = email.toLowerCase().trim().replace(/[^a-zA-Z0-9]/g, "");
    const otpRef = db.ref(`otp-requests/${trackingId}`);
    const snapshot = await otpRef.once("value");

    if (!snapshot.exists()) {
      return res.status(400).json({ 
        error: "No active security code found for this account.",
        code: "auth/otp-not-found"
      });
    }

    const data = snapshot.val();
    if (Date.now() > data.expiresAt) {
      await otpRef.remove();
      return res.status(400).json({ 
        error: "The security code has expired.",
        code: "auth/otp-expired"
      });
    }

    if (data.code !== otp.toString().trim()) {
      return res.status(400).json({ 
        error: "Invalid security code.",
        code: "auth/invalid-otp"
      });
    }

    await auth.updateUser(uid, { password: newPassword });
    await db.ref(`accounts/${uid}`).update({
      requiresPasswordChange: false,
      updatedAt: new Date().toISOString(),
    });

    await otpRef.remove();
    return res.status(200).json({ 
      success: true,
      message: "Password has been reset successfully."
    });

  } catch (error) {
    console.error("Reset Password API Error:", error.message);
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ error: "Account not found.", code: error.code });
    }
    return res.status(500).json({ 
      error: "An internal security error occurred during password reset.",
      details: error.message
    });
  }
}
