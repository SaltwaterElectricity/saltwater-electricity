<<<<<<< HEAD
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
        "Communications link interrupted. Please verify your connection or try again later.",
        true,
        "email/delivery-failed"
      ),
    };
  }
=======
import emailjs from '@emailjs/browser';

//CONFIGURATION
const CONFIG = {
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  // Using specific IDs for different business logic
  ONBOARDING_TEMPLATE: import.meta.env.VITE_EMAILJS_ONBOARDING_TEMPLATE_ID,
  OTP_TEMPLATE: import.meta.env.VITE_EMAILJS_OTP_TEMPLATE_ID,
  COMPANY_EMAIL: import.meta.env.VITE_COMPANY_EMAIL
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
};

// SEND OTP EMAIL
export const sendOTPEmail = async (email, otpCode) => {
<<<<<<< HEAD
  if (!email || !otpCode) {
    return {
      success: false,
      error: new appError("Missing recipient or reset code.", true, "email/invalid-parameters"),
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
=======
  // SAFETY CHECK
  if (!email || !otpCode) {
    throw new Error("Validation Error: Missing recipient or reset code.");
  }

  // Kinakalkula ang expiry time (15 minutes mula ngayon)
  const expiryTime = new Date(Date.now() + 15 * 60000).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const templateParams = {
    to_email: email,
    passcode: otpCode,       
    time: expiryTime,         
    company_name: "SmartAqua" 
  };

  try {
    const { SERVICE_ID, OTP_TEMPLATE, PUBLIC_KEY } = CONFIG;
    await emailjs.send(SERVICE_ID, OTP_TEMPLATE, templateParams, PUBLIC_KEY);

    
    return { success: true };
  } catch (error) {
    // I-mask ang error para sa security
    throw new Error("Failed to deliver the security code. Please try again later.");
  }
};

//SEND ONBOARDING EMAIL
export const sendOnboardingEmail = async (userData, autoPassword) => {
  // SAFETY CHECK
  if (!userData?.email || !autoPassword) {
    throw new Error("Validation Error: Missing user data or generated password.");
  }

  const templateParams = {
    to_email: userData.email,
    firstName: userData.firstName,
    userName: userData.userName || "N/A",
    defaultPassword: autoPassword,
    system_role: userData.role || "Staff",
    website_link: "https://smartaqua-monitoring.web.app",
    company_email: COMPANY_EMAIL
  };

  try {
    const { SERVICE_ID, ONBOARDING_TEMPLATE, PUBLIC_KEY } = CONFIG;
    
    await emailjs.send(
      SERVICE_ID, 
      ONBOARDING_TEMPLATE, 
      templateParams, 
      PUBLIC_KEY
    );

    return { success: true, emailSent: true };
  } catch (error) {
    return { success: true, emailSent: false };
  }
};
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
