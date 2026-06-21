import { ref, get, set, remove, serverTimestamp } from "firebase/database";
import { db } from "../firebaseConfig";
import { appError } from "../utils/appError";
import { logger } from "../utils/logger";
import { sendOTPEmail } from "./email.service";

/**
 * OTP SERVICE (Realtime Database)
 * 
 * Handles generation and verification of 6-digit security codes.
 * Adheres to One-Time Use policies and secure server-side synchronization.
 */

const OTP_EXPIRY_MS = 300000; // 5 minutes

/**
 * GENERATE OTP
 * 
 * 1. Generates a 6-digit numeric code.
 * 2. Saves it to the '/otp-requests/{userId}' node in RTDB.
 * 3. Sends the code via EmailJS (never returned to frontend).
 */
export const generateOTP = async (userId, email) => {
  if (!userId || !email) {
    throw new appError("User identification and email are required.", true, "otp/invalid-parameters");
  }

  try {
    // 🛡️ SECURITY: Verify user existence before sending email
    const userRef = ref(db, `users/${userId}`);
    const userSnap = await get(userRef);

    if (!userSnap.exists()) {
      logger.warn(`OTP Request blocked: User ${userId} does not exist.`);
      return { success: true }; // OWASP: Anti-enumeration silent return
    }

    const userData = userSnap.val();
    if (userData.email.toLowerCase() !== email.toLowerCase().trim()) {
      logger.warn(`OTP Request blocked: Email mismatch for ${userId}.`);
      return { success: true }; // OWASP: Anti-enumeration silent return
    }

    // 1. Generate a 6-digit numeric code
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    const otpCode = (array[0] % 900000 + 100000).toString();

    // 2. Save to RTDB: '/otp-requests/{userId}'
    const otpRef = ref(db, `otp-requests/${userId}`);
    await set(otpRef, {
      email,
      code: otpCode,
      createdAt: serverTimestamp(),
      expiresAt: Date.now() + OTP_EXPIRY_MS
    });

    // 3. Delivery (Secure: Only send via email)
    await sendOTPEmail(email, otpCode);

    return { success: true };

  } catch (error) {
    if (error instanceof appError) throw error;
    logger.error("OTP Generation Error:", error);
    throw new appError("Failed to deliver the security code. Please try again.", true, "otp/request-failed");
  }
};

/**
 * VERIFY OTP
 * 
 * 1. Reads data from '/otp-requests/{userId}'.
 * 2. Logic: Return true if code matches AND it has not expired.
 * 3. Once verified or expired, the function deletes the OTP entry (One-Time use).
 */
export const verifyOTP = async (userId, inputCode) => {
  if (!userId || !inputCode) {
    throw new appError("User ID and code are required for verification.", true, "otp/invalid-parameters");
  }

  const otpRef = ref(db, `otp-requests/${userId}`);

  try {
    const snapshot = await get(otpRef);
    
    if (!snapshot.exists()) {
      throw new appError("No active security code found for this account.", true, "otp/not-found");
    }

    const data = snapshot.val();

    // Logic: Return true if code matches AND not expired
    const isExpired = Date.now() > data.expiresAt;
    const isMatch = data.code === inputCode.toString().trim();

    // 🛡️ One-Time Use Policy: Delete if verified or if it has expired
    if (isMatch || isExpired) {
      await remove(otpRef);
    }

    if (isExpired) {
      throw new appError("This security code has expired. Please request a new one.", true, "otp/expired");
    }

    if (!isMatch) {
      throw new appError("Invalid security code.", true, "otp/invalid-code");
    }

    return { verified: true, email: data.email };

  } catch (error) {
    if (error instanceof appError) throw error;
    logger.error("OTP Verification Error:", error);
    throw new appError(error.message || "Security verification failed.", true, "otp/verification-failed");
  }
};

/**
 * Wrappers for UI compatibility (RequestOTPStep / VerifyOTPStep)
 */
export const requestPasswordResetOTP = async (email, userId) => generateOTP(userId, email);
export const verifyResetOTP = verifyOTP;
