<<<<<<< HEAD
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
=======
import { db } from "../config/firebase";
import { 
  doc, 
  getDoc, 
  runTransaction, 
  serverTimestamp, 
  Timestamp 
} from "firebase/firestore";
// IMPORT your email delivery function
import { sendOTPEmail } from "./email.service";

const COLLECTIONS = Object.freeze({
  USERS: "users",
  OTPS: "otps" 
});

const LIMITS = Object.freeze({
  RATE_LIMIT_MS: 60000,
  EXPIRY_MS: 300000,
  MAX_ATTEMPTS: 5
});

/**
 * REQUEST PASSWORD RESET OTP
 * Now fully integrated with Database Integrity Checks and EmailJS.
 */
export const requestPasswordResetOTP = async (typedEmail, userId) => {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  const otpRef = doc(db, COLLECTIONS.OTPS, userId);

  try {
    // 1. DATABASE INTEGRITY CHECK (The Guard)
    const userSnap = await getDoc(userRef);

    // OWASP: Silent return if user doesn't exist
    if (!userSnap.exists()) {
      console.warn(`Enumeration attempt blocked: ${userId}`);
      return { success: true }; 
    }

    // 2. EMAIL VALIDATION: Ensure the input matches the DB record
    const userData = userSnap.data();
    if (userData.email.toLowerCase() !== typedEmail.toLowerCase().trim()) {
      console.warn(`Email mismatch for ID: ${userId}`);
      return { success: true };
    }

    // This variable will hold the code generated inside the transaction 
    // so we can use it for the email later.
    let generatedCode = "";

    // 3. ATOMIC TRANSACTION
    await runTransaction(db, async (transaction) => {
      const otpDoc = await transaction.get(otpRef);

      if (otpDoc.exists()) {
        const data = otpDoc.data();
        const createdAt = data.createdAt 
          ? data.createdAt.toMillis() 
          : Date.now() - (LIMITS.RATE_LIMIT_MS + 1000);

        if (Date.now() - createdAt < LIMITS.RATE_LIMIT_MS) {
          const remaining = Math.ceil((LIMITS.RATE_LIMIT_MS - (Date.now() - createdAt)) / 1000);
          throw new Error(`Please wait ${remaining}s before requesting again.`);
        }
      }

      // SECURE GENERATION
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      const otpCode = (array[0] % 900000 + 100000).toString();
      generatedCode = otpCode; // Store for email function

      transaction.set(otpRef, {
        userId,
        email: userData.email, // Use DB verified email
        code: otpCode,
        expiresAt: Timestamp.fromDate(new Date(Date.now() + LIMITS.EXPIRY_MS)),
        createdAt: serverTimestamp(),
        attempts: 0,
        type: "password_reset"
      });
    });

    // 4. DELIVERY: Send email ONLY if transaction succeeded
    // We use userData.email (the Source of Truth)
    await sendOTPEmail(userData.email, generatedCode);

    return { success: true };
  } catch (error) {
    console.error("OTP Request Error:", error.message);
    throw error;
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
  }
};

/**
<<<<<<< HEAD
 * VERIFY OTP
 *
 * 1. Reads data from '/otp-requests/{userId}'.
 * 2. Logic: Return true if code matches AND it has not expired.
 * 3. Once verified or expired, the function deletes the OTP entry (One-Time use).
 */
export const verifyOTP = async (userId, inputCode) => {
  if (!userId || !inputCode) {
    throw new appError("Verification parameters are missing.", true, "otp/invalid-parameters");
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
      "Security verification failed. Please try again.",
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
=======
 * VERIFY PASSWORD RESET OTP
 */
export const verifyResetOTP = async (userId, submittedCode) => {
  const otpRef = doc(db, COLLECTIONS.OTPS, userId);

  try {
    return await runTransaction(db, async (transaction) => {
      const otpSnap = await transaction.get(otpRef);

      if (!otpSnap.exists()) {
        throw new Error("No active reset request found.");
      }

      const data = otpSnap.data();

      if (Timestamp.now().toMillis() > data.expiresAt.toMillis()) {
        transaction.delete(otpRef);
        throw new Error("This code has expired.");
      }

      if (data.attempts >= (LIMITS.MAX_ATTEMPTS - 1) && data.code !== submittedCode) {
        transaction.delete(otpRef);
        throw new Error("Security lockout: Too many failed attempts.");
      }

      // In your current service file:
        if (data.code === submittedCode) {
        const verifiedEmail = data.email; // Capture email before deleting doc
        transaction.delete(otpRef);
        return { verified: true, email: verifiedEmail }; // Return email

      } else {
        const newAttempts = (data.attempts || 0) + 1;
        transaction.update(otpRef, { attempts: newAttempts });
        throw new Error(`Invalid code. ${LIMITS.MAX_ATTEMPTS - newAttempts} attempts remaining.`);
      }
    });
  } catch (error) {
    console.error("OTP Verification Error:", error.message);
    throw error;
  }
};
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
