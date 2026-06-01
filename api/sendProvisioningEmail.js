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

  const apiKey = process.env.SENDGRID_API_KEY;
  const senderEmail = process.env.SENDGRID_SENDER_EMAIL;

  if (!apiKey || !senderEmail) {
    console.error("[sendProvisioningEmail] Missing SendGrid configuration.");
    return sendError(res, "Mail service configuration missing.", 500, "mail/config-missing");
  }

  sgMail.setApiKey(apiKey);

  try {
    const { to, subject, templateType, templateData, htmlContent } = req.body;

    if (!to || !subject) {
      return sendError(res, "Missing recipient or subject.", 400, "mail/missing-fields");
    }

    let finalHtml = htmlContent;

    if (templateType === "onboarding") {
      finalHtml = `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #006591;">Welcome to Saltwater Electricity</h2>
          <p>Hello ${templateData.firstName || "User"},</p>
          <p>Your account is ready. Use the credentials below to log in:</p>
          <div style="background: #f0f4fa; padding: 15px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Username:</strong> ${templateData.userName}</p>
            <p><strong>Temporary Password:</strong> ${templateData.tempPassword}</p>
            <p><strong>System Role:</strong> ${templateData.role}</p>
          </div>
          <p>Change your password immediately after first login.</p>
        </div>
      `;
    } else if (templateType === "otp") {
      finalHtml = `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #006591;">Security Code</h2>
          <p>Your 6-digit verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 30px 0;">
            ${templateData.otpCode}
          </div>
          <p>This code expires in 15 minutes.</p>
        </div>
      `;
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
    return sendSuccess(res);
  } catch (error) {
    return sendError(res, error, 500, "mail/delivery-failed");
  }
}
