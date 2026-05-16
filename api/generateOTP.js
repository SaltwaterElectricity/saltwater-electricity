import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";
import sgMail from "@sendgrid/mail";

/**
 * Vercel Serverless Function: generateOTP
 *
 * Securely generates an OTP for password reset.
 * Uses Firebase Admin SDK to check user existence and RTDB access.
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

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  try {
    // 3. Modular Initialization
    if (!getApps().length) {
      const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;

      if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
          "Missing Firebase Admin credentials (PROJECT_ID, CLIENT_EMAIL, or PRIVATE_KEY)."
        );
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

    // Set SendGrid key inside handler
    const sgKey = process.env.SENDGRID_API_KEY;
    if (!sgKey) throw new Error("Missing SENDGRID_API_KEY.");
    sgMail.setApiKey(sgKey);

    const OTP_EXPIRY_MS = 900000; // 15 minutes

    // 4. Logic Execution
    try {
      await auth.getUserByEmail(email);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        return res.status(200).json({ success: true });
      }
      throw error;
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const trackingId = email
      .toLowerCase()
      .trim()
      .replace(/[^a-zA-Z0-9]/g, "");
    const otpRef = db.ref(`otp-requests/${trackingId}`);

    await otpRef.set({
      email,
      code: otpCode,
      createdAt: new Date().toISOString(), // Fallback for ServerValue
      expiresAt: Date.now() + OTP_EXPIRY_MS,
    });

    if (!process.env.SENDGRID_SENDER_EMAIL) {
      throw new Error("Missing SENDGRID_SENDER_EMAIL.");
    }

    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_SENDER_EMAIL,
        name: "Saltwater Electricity System",
      },
      subject: "Your Security Code",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #006591;">Security Code</h2>
          <p>Your 6-digit verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 30px 0;">
            ${otpCode}
          </div>
          <p>This code expires in 15 minutes.</p>
        </div>
      `,
    };

    await sgMail.send(msg);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Generate OTP API Error:", error.message);
    return res.status(500).json({
      error: "Failed to process security request.",
      details: error.message,
    });
  }
}
