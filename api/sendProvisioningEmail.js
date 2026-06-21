import { initFirebaseAdmin } from "./_utils/firebase.js";
import { sendSuccess, sendError, handleOptions } from "./_utils/response.js";
import sgMail from "@sendgrid/mail";

/**
 * Vercel Serverless Function: sendProvisioningEmail
 * Securely triggers SendGrid emails from the backend.
 */
export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    return sendError(res, "Method Not Allowed", 405, "mail/method-not-allowed");
  }

  // Verify ID Token and Admin/SuperAdmin Role
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "Authentication required.", 401, "mail/unauthorized");
  }

  const token = authHeader.split(" ")[1];
  try {
    const { auth, db } = initFirebaseAdmin();
    const decodedToken = await auth.verifyIdToken(token);

    // Read user role
    const roleSnap = await db.ref(`roles/${decodedToken.uid}`).get();
    const userRole = roleSnap.exists() ? roleSnap.val().role : null;

    if (userRole !== "admin" && userRole !== "superAdmin") {
      console.warn(`[SECURITY] Unauthorized email access attempt by user: ${decodedToken.email}`);
      return sendError(res, "Forbidden: Administrative access required.", 403, "mail/forbidden");
    }
  } catch (error) {
    console.error("[SECURITY] Invalid token presented to sendProvisioningEmail:", error.message);
    return sendError(res, "Invalid session token.", 401, "mail/invalid-token");
  }

  const apiKey = process.env.SENDGRID_API_KEY;
  const senderEmail = process.env.SENDGRID_SENDER_EMAIL;

  if (!apiKey || !senderEmail) {
    console.error("[sendProvisioningEmail] Missing SendGrid configuration.");
    return sendError(res, "Mail service configuration missing.", 500, "mail/config-missing");
  }

  sgMail.setApiKey(apiKey);

  try {
    const { to, subject, templateType, templateData = {}, htmlContent } = req.body || {};

    console.warn(`[sendProvisioningEmail] Incoming request: to=${to}, type=${templateType}`);

    if (!to || !subject) {
      console.warn("[sendProvisioningEmail] Missing recipient or subject.");
      return sendError(res, "Missing recipient or subject.", 400, "mail/missing-fields");
    }

    let finalHtml = htmlContent;

    if (templateType === "onboarding") {
      const { firstName = "User", tempPassword = "N/A", role = "Resident" } = templateData;
      finalHtml = `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #006591;">Welcome to Saltwater Electricity</h2>
          <p>Hello ${firstName},</p>
          <p>Your account is ready. Use the credentials below to log in:</p>
          <div style="background: #f0f4fa; padding: 15px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Temporary Password:</strong> ${tempPassword}</p>
            <p><strong>System Role:</strong> ${role}</p>
          </div>
          <p>Change your password immediately after first login.</p>
        </div>
      `;
    } else if (templateType === "otp") {
      const { otpCode = "000000" } = templateData;
      finalHtml = `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #006591;">Security Code</h2>
          <p>Your 6-digit verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 30px 0;">
            ${otpCode}
          </div>
          <p>This code expires in 15 minutes.</p>
        </div>
      `;
    }

    if (!finalHtml) {
      console.warn("[sendProvisioningEmail] No HTML content generated.");
      return sendError(res, "No email content generated.", 400, "mail/empty-content");
    }

    const msg = {
      to,
      from: {
        email: senderEmail,
        name: "Saltwater Electricity System",
      },
      subject,
      html: finalHtml,
    };

    await sgMail.send(msg);
    console.warn("[sendProvisioningEmail] Email sent successfully to:", to);
    return sendSuccess(res);
  } catch (error) {
    // SECURITY: Extract SendGrid specific error details if they exist
    let errorMessage = error.message;
    if (error.response && error.response.body && error.response.body.errors) {
      errorMessage = error.response.body.errors.map((e) => e.message).join(" | ");
    }

    console.error("[sendProvisioningEmail] SendGrid Failure:", errorMessage);

    return sendError(res, errorMessage, 500, "mail/delivery-failed");
  }
}
