import { appError } from "../utils/appError";
import { logger } from "../utils/logger";

/**
 * EMAIL SERVICE (Refactored for Vercel Serverless Functions)
 *
 * Secure backend triggers for SendGrid communications.
 */

// Email Validation Regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidEmail = (email) => EMAIL_REGEX.test(email);

/**
 * Generic internal handler to call the Vercel Serverless API.
 */
const triggerSecureEmail = async (emailData) => {
  if (!isValidEmail(emailData.to)) {
    return {
      success: false,
      error: new appError("Invalid recipient email address.", true, "email/invalid-email"),
    };
  }

  try {
    const response = await fetch("/api/sendProvisioningEmail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    // Check if the response is JSON
    const contentType = response.headers.get("content-type");
    let result = {};
    if (contentType && contentType.includes("application/json")) {
      result = await response.json();
    }

    if (!response.ok) {
      throw new Error(result.error || `HTTP error! status: ${response.status}`);
    }

    return { success: true, error: null };
  } catch (error) {
    // SECURITY: Log technical details internally
    logger.error("[Email Service]: Vercel trigger failed.", error);

    // UX: Neutral error message
    return {
      success: false,
      error: new appError(
        "Connection lost. Please check your network and try again later.",
        true,
        "email/delivery-failed"
      ),
    };
  }
};

// SEND OTP EMAIL
export const sendOTPEmail = async (email, otpCode) => {
  if (!email || !otpCode) {
    return {
      success: false,
      error: new appError(
        "Required information for the security code is missing.",
        true,
        "email/invalid-parameters"
      ),
    };
  }

  const expiryTime = new Date(Date.now() + 15 * 60000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return await triggerSecureEmail({
    to: email,
    subject: `Security Code: ${otpCode}`,
    templateType: "otp",
    templateData: {
      otpCode,
      expiryTime,
    },
  });
};

// SEND ONBOARDING EMAIL
export const sendOnboardingEmail = async (userData, autoPassword) => {
  if (!userData?.email || !autoPassword) {
    return {
      success: false,
      error: new appError(
        "Missing user data or generated password.",
        true,
        "email/invalid-parameters"
      ),
    };
  }

  const result = await triggerSecureEmail({
    to: userData.email,
    subject: "Welcome to Saltwater Electricity System",
    templateType: "onboarding",
    templateData: {
      firstName: userData.firstName,
      userName: userData.userName,
      tempPassword: autoPassword,
      role: userData.role,
    },
  });

  return {
    success: true,
    emailSent: result.success,
    error: result.error,
  };
};
