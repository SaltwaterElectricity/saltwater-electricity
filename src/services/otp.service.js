import {
  ref,
  get,
  set,
  remove,
  serverTimestamp,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
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
 * 1. Finds user by email to get their Auth UID.
 * 2. Generates a 6-digit numeric code.
 * 3. Saves it to the '/otp-requests/{userId}' node in RTDB.
 * 4. Sends the code via SendGrid (never returned to frontend).
 */
export const generateOTP = async (userId_not_used, email) => {
  if (!email) {
    throw new appError("Email is required for password reset.", true, "otp/invalid-parameters");
  }

  try {
    // 🛡️ SECURITY: Verify user existence before sending email
    const usersRef = ref(db, "users");
    const emailQuery = query(usersRef, orderByChild("email"), equalTo(email.toLowerCase().trim()));
    const snapshot = await get(emailQuery);

    if (!snapshot.exists()) {
      logger.warn(`OTP Request blocked: No account for ${email}.`);
      return { success: true }; // OWASP: Anti-enumeration silent return
    }

    // Pull the actual UID and data
    const userEntries = Object.entries(snapshot.val());
    const [uid] = userEntries[0];

    // 1. Generate a 6-digit numeric code
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    const otpCode = ((array[0] % 900000) + 100000).toString();

    // 2. Save to RTDB: '/otp-requests/{userId}' using the real UID
    const otpRef = ref(db, `otp-requests/${uid}`);
    await set(otpRef, {
      email,
      code: otpCode,
      createdAt: serverTimestamp(),
      expiresAt: Date.now() + OTP_EXPIRY_MS,
    });

    // 3. Delivery (Secure: Only send via email)
    const result = await sendOTPEmail(email, otpCode);
    if (!result.success) {
      throw result.error;
    }

    return { success: true };
  } catch (error) {
    if (error instanceof appError) throw error;
    logger.error("OTP Generation Error:", error);
    throw new appError(
      "Failed to deliver the security code. Please try again.",
      true,
      "otp/request-failed"
    );
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
    throw new appError(
      "User ID and code are required for verification.",
      true,
      "otp/invalid-parameters"
    );
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
      throw new appError(
        "This security code has expired. Please request a new one.",
        true,
        "otp/expired"
      );
    }

    if (!isMatch) {
      throw new appError("Invalid security code.", true, "otp/invalid-code");
    }

    return { verified: true, email: data.email };
  } catch (error) {
    if (error instanceof appError) throw error;
    logger.error("OTP Verification Error:", error);
    throw new appError(
      error.message || "Security verification failed.",
      true,
      "otp/verification-failed"
    );
  }
};

/**
 * Wrappers for UI compatibility (RequestOTPStep / VerifyOTPStep)
 */
export const requestPasswordResetOTP = async (email, userId) => generateOTP(userId, email);
export const verifyResetOTP = verifyOTP;
