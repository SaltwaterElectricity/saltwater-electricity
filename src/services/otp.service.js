import { appError } from "../utils/appError";
import { logger } from "../utils/logger";

/**
 * OTP SERVICE (Backend-Powered)
 *
 * Handles generation and verification of 6-digit security codes.
 * Migrated to backend serverless functions to support unauthenticated access
 * while maintaining strict security rules in Firebase.
 */

/**
 * GENERATE OTP
 * Calls the backend API to handle user lookup and code delivery.
 */
export const generateOTP = async (userId_not_used, email) => {
  if (!email) {
    throw new appError("Email is required for password reset.", true, "otp/invalid-parameters");
  }

  try {
    const response = await fetch("/api/generateOTP", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    // 🛡️ Robust Parsing: Handle empty or non-JSON responses
    const contentType = response.headers.get("content-type");
    let result = {};

    if (contentType && contentType.includes("application/json")) {
      result = await response.json();
    } else {
      const text = await response.text();
      logger.error("Non-JSON response from generateOTP:", text);
      throw new appError(
        "The security service encountered a communications error. Please try again.",
        true,
        "otp/invalid-response"
      );
    }

    if (!response.ok) {
      throw new appError(
        result.error || "Failed to deliver the security code. Please try again.",
        true,
        result.code || "otp/request-failed"
      );
    }

    return { success: true };
  } catch (error) {
    if (error instanceof appError) throw error;
    logger.error("OTP Generation Error:", error);
    throw new appError(
      "The security service is currently offline. Please try again in a few moments.",
      true,
      "otp/service-unavailable"
    );
  }
};

/**
 * VERIFY OTP
 * Calls the backend API to verify the code without needing RTDB read permissions.
 */
export const verifyOTP = async (trackingId, inputCode, shouldDelete = false) => {
  if (!trackingId || !inputCode) {
    throw new appError("Some security information is missing. Please try again.", true, "otp/invalid-parameters");
  }

  try {
    const response = await fetch("/api/verifyOTP", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackingId, code: inputCode, shouldDelete }),
    });

    // 🛡️ Robust Parsing: Handle empty or non-JSON responses
    const contentType = response.headers.get("content-type");
    let result = {};

    if (contentType && contentType.includes("application/json")) {
      result = await response.json();
    } else {
      const text = await response.text();
      logger.error("Non-JSON response from verifyOTP:", text);
      throw new appError(
        "The verification service encountered a communications error.",
        true,
        "otp/invalid-response"
      );
    }

    if (!response.ok) {
      throw new appError(
        result.error || "Security verification failed.",
        true,
        result.code || "otp/verification-failed"
      );
    }

    return { verified: true, email: result.email };
  } catch (error) {
    if (error instanceof appError) throw error;
    logger.error("OTP Verification Error:", error);
    throw new appError(
      "Security verification failed. Please try again.",
      true,
      "otp/verification-failed"
    );
  }
};

/**
 * Wrappers for UI compatibility
 */
export const requestPasswordResetOTP = async (email, userId) => generateOTP(userId, email);
export const verifyResetOTP = verifyOTP;
