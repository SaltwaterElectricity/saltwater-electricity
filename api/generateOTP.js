import { initFirebaseAdmin } from "./_utils/firebase.js";
import { sendSuccess, sendError, handleOptions } from "./_utils/response.js";
import sgMail from "@sendgrid/mail";

/**
 * Vercel Serverless Function: generateOTP
 * Securely generates an OTP for password reset.
 */
export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  if (req.method === "GET" && req.query.ping) {
    return sendSuccess(res, { message: "API is reachable" });
  }

  if (req.method !== "POST") {
    return sendError(res, "Method Not Allowed", 405, "auth/method-not-allowed");
  }

  const { email } = req.body;
  if (!email) {
    return sendError(res, "Email is required.", 400, "auth/missing-email");
  }

  try {
    const { auth, db } = initFirebaseAdmin();

    // Set SendGrid key
    const sgKey = process.env.SENDGRID_API_KEY;
    const senderEmail = process.env.SENDGRID_SENDER_EMAIL;

    if (!sgKey || !senderEmail) {
      console.error("[generateOTP] Missing SendGrid configuration.");
      throw new Error("Mail service configuration missing.");
    }

    sgMail.setApiKey(sgKey);

    const OTP_EXPIRY_MS = 900000; // 15 minutes

    // Enumeration Prevention Protocol (EPP)
    try {
      await auth.getUserByEmail(email);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        // Return success even if user not found to prevent identity discovery
        return sendSuccess(res);
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
      createdAt: new Date().toISOString(),
      expiresAt: Date.now() + OTP_EXPIRY_MS,
    });

    const msg = {
      to: email,
      from: {
        email: senderEmail,
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
    return sendSuccess(res);
  } catch (error) {
    return sendError(res, error, 500, "auth/generate-otp-failed");
  }
}
