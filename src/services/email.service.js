import axios from "axios";
import { appError } from "../utils/appError";
import { logger } from "../utils/logger";

// CONFIGURATION
const CONFIG = {
  API_KEY: import.meta.env.VITE_SENDGRID_API_KEY,
  SENDER_EMAIL: import.meta.env.VITE_SENDGRID_SENDER_EMAIL,
  COMPANY_NAME: "Saltwater Electricity System",
  COMPANY_EMAIL: import.meta.env.VITE_COMPANY_EMAIL
};

// Email Validation Regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates the recipient email.
 * @param {string} email 
 * @returns {boolean}
 */
const isValidEmail = (email) => EMAIL_REGEX.test(email);

/**
 * Generic function to send email via SendGrid REST API v3
 */
const sendEmail = async ({ to, subject, htmlContent }) => {
  if (!isValidEmail(to)) {
    return { 
      success: false, 
      error: new appError("Invalid recipient email address.", true, "email/invalid-email") 
    };
  }

  if (!CONFIG.API_KEY || !CONFIG.SENDER_EMAIL) {
    logger.error("[Email Service]: SendGrid credentials missing.");
    return { 
      success: false, 
      error: new appError("Email service is currently unavailable.", true, "email/config-error") 
    };
  }

  const data = {
    personalizations: [
      {
        to: [{ email: to }]
      }
    ],
    from: {
      email: CONFIG.SENDER_EMAIL,
      name: CONFIG.COMPANY_NAME
    },
    subject: subject,
    content: [
      {
        type: "text/html",
        value: htmlContent
      }
    ]
  };

  try {
    await axios.post("https://api.sendgrid.com/v3/mail/send", data, {
      headers: {
        Authorization: `Bearer ${CONFIG.API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    return { success: true, error: null };
  } catch (error) {
    logger.error("[Email Service]: Delivery failed.", error.response?.data || error.message);
    return { 
      success: false, 
      error: new appError("Failed to deliver the email. Please try again later.", true, "email/delivery-failed") 
    };
  }
};

// SEND OTP EMAIL
export const sendOTPEmail = async (email, otpCode) => {
  // SAFETY CHECK
  if (!email || !otpCode) {
    return { 
      success: false, 
      error: new appError("Missing recipient or reset code.", true, "email/invalid-parameters") 
    };
  }

  const expiryTime = new Date(Date.now() + 15 * 60000).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const htmlContent = `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <h2 style="color: #2563eb;">Security Code</h2>
      <p>Hello,</p>
      <p>Your security code for <strong>${CONFIG.COMPANY_NAME}</strong> is:</p>
      <div style="font-size: 24px; font-weight: bold; padding: 10px; background: #f3f4f6; text-align: center; letter-spacing: 5px; margin: 20px 0;">
        ${otpCode}
      </div>
      <p>This code will expire at <strong>${expiryTime}</strong>.</p>
      <p>If you did not request this code, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666;">This is an automated message from ${CONFIG.COMPANY_NAME}.</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: `Your Security Code: ${otpCode}`,
    htmlContent
  });
};

// SEND ONBOARDING EMAIL
export const sendOnboardingEmail = async (userData, autoPassword) => {
  // SAFETY CHECK
  if (!userData?.email || !autoPassword) {
    return { 
      success: false, 
      error: new appError("Missing user data or generated password.", true, "email/invalid-parameters") 
    };
  }

  const htmlContent = `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <h2 style="color: #2563eb;">Welcome to ${CONFIG.COMPANY_NAME}</h2>
      <p>Hello ${userData.firstName || 'User'},</p>
      <p>An account has been created for you in the Saltwater Electricity Monitoring System.</p>
      <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Username:</strong> ${userData.userName || "N/A"}</p>
        <p><strong>Temporary Password:</strong> ${autoPassword}</p>
        <p><strong>Role:</strong> ${userData.role || "Staff"}</p>
      </div>
      <p>Please log in and change your password immediately: <a href="https://smartaqua-monitoring.web.app">Login Here</a></p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666;">For support, contact: ${CONFIG.COMPANY_EMAIL}</p>
    </div>
  `;

  const result = await sendEmail({
    to: userData.email,
    subject: `Welcome to ${CONFIG.COMPANY_NAME}`,
    htmlContent
  });

  // For onboarding, we return emailSent status
  return { 
    success: true, 
    emailSent: result.success, 
    error: result.error 
  };
};
