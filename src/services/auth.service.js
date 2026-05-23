import { auth, db, FIREBASE_CONFIG } from "../firebaseConfig";
import { ref, get, update, serverTimestamp } from "firebase/database";
import { initializeApp, deleteApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence,
  getAuth,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";

import { ROLES } from "../constants/roles";
import { appError } from "../utils/appError";
import { logger } from "../utils/logger";
import { generateDefaultPassword } from "../utils/passwordGenerator";
import { sendOnboardingEmail } from "./email.service";
import { sanitizeForFirebaseKey } from "../utils/sanitization";

/**
 * ERROR MAPPER: Centralized for all auth actions.
 */
export const AUTH_ERROR_MESSAGES = Object.freeze({
  "auth/email-already-in-use": "This email is already registered in the system.",
  "auth/invalid-email": "The email address format is not valid.",
  "auth/weak-password":
    "Security Check: Password must be at least 8 characters and include numbers/symbols.",
  "auth/user-not-found": "Invalid email or password. Please try again.",
  "auth/wrong-password": "Invalid email or password. Please try again.",
  "auth/invalid-credential": "Invalid email or password. Please try again.",
  "auth/missing-credentials": "Email and password are required.",
  "auth/requires-recent-login": "Security timeout. Please re-verify your identity again.",
  "auth/network-request-failed":
    "Connection Error: Please check the facility's internet stability.",
  "auth/too-many-requests":
    "Account temporarily locked due to many failed attempts. Try again later.",
  "auth/user-disabled": "This account has been disabled by a system administrator.",
  PERMISSION_DENIED: "Security Check: You do not have permission to access this data.",
  "db/permission-denied": "Security Check: You do not have permission to access this data.",
  unavailable: "The service is currently offline. Please check your connection.",
  default: "An unexpected authentication error occurred.",
});

export const validateEmail = (email) => {
  // Mas matibay kaysa sa .includes("@"). Sinisiguro nito ang format na: user@domain.com
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    const code = "auth/invalid-email";
    throw new appError(AUTH_ERROR_MESSAGES[code] || "A valid email is required.", true, code);
  }
};

export const validatePassword = (password) => {
  const code = "auth/weak-password";
  // 1. LENGTH CHECK (Minimum 8 characters)
  if (!password || password.length < 8) {
    throw new appError(
      AUTH_ERROR_MESSAGES[code] || "Security Check: Password must be at least 8 characters.",
      true,
      code
    );
  }

  const complexityRegex = /^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/;

  if (!complexityRegex.test(password)) {
    // Maaari mong gawing mas descriptive ang message sa loob ng AUTH_ERROR_MESSAGES object
    throw new appError(
      AUTH_ERROR_MESSAGES[code] ||
        "Security Check: Password must include at least one number and one special character.",
      true,
      code
    );
  }
};

/**
 * FINALIZED: Updates password for the current user.
 */
export const changeUserPassword = async (
  newPassword,
  { currentPassword = null, isForceReset = false } = {}
) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user)
    throw new appError("Session expired. Please log in again.", true, "auth/session-expired");

  validatePassword(newPassword);

  try {
    // 🛡️ SECURITY CHECK: Kung hindi force reset, kailangan ng re-authentication
    if (!isForceReset) {
      if (!currentPassword)
        throw new appError(
          "Current password is required for profile updates.",
          true,
          "auth/missing-current-password"
        );
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
    }

    // 🔑 Magpalit ng Password
    await updatePassword(user, newPassword);

    // 📊 I-update ang Realtime Database Flags
    const { uid } = user;
    const updates = {};
    updates[`/accounts/${uid}/requiresPasswordChange`] = false;
    updates[`/accounts/${uid}/updatedAt`] = serverTimestamp();

    await update(ref(db), updates);

    return { success: true };
  } catch (error) {
    if (error instanceof appError) throw error;

    // SECURITY: Log technical details internally
    logger.error("[Auth Service]: Password update failed.", error);

    const code = error.code || "default";
    throw new appError(
      AUTH_ERROR_MESSAGES[code] ||
        "Security system encountered an error updating credentials. Please try again.",
      true,
      code
    );
  }
};

/**
 * Decoupled: Sends credentials via email.
 * Should only be called AFTER successful database provisioning.
 */
export const sendCredentials = async (userData, password) => {
  return await sendOnboardingEmail(userData, password);
};

/**
 * Registers a new user account (IDENTITY ONLY).
 * Returns references for DB provisioning and potential rollback.
 */
export const registerUserAccount = async (userData) => {
  const { email } = userData;
  let tempApp = null;

  try {
    validateEmail(email);

    const autoPassword = generateDefaultPassword();
    const appName = `TempApp_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    tempApp = initializeApp(FIREBASE_CONFIG, appName);
    const tempAuth = getAuth(tempApp);

    // 1. ATOMIC ACCOUNT CREATION (Auth Node only)
    const userCredential = await createUserWithEmailAndPassword(tempAuth, email, autoPassword);

    return {
      uid: userCredential.user.uid,
      tempPassword: autoPassword,
      tempUser: userCredential.user,
      tempApp: tempApp,
    };
  } catch (error) {
    if (tempApp) {
      try {
        await deleteApp(tempApp);
      } catch {
        /* silent cleanup */
      }
    }
    if (error instanceof appError) throw error;
    const code = error.code || "default";
    throw new appError(AUTH_ERROR_MESSAGES[code] || AUTH_ERROR_MESSAGES.default, true, code);
  }
};

/**
 * ROLLBACK UTILITY: Deletes an Auth user if DB provisioning fails.
 */
export const deleteAuthUser = async (user) => {
  if (!user) return;
  try {
    const { deleteUser } = await import("firebase/auth");
    await deleteUser(user);
    return { success: true };
  } catch (error) {
    logger.error("[Auth Service]: Rollback deletion failed.", error);
    // Don't throw here, we want the original DB error to be the primary one.
  }
};

/**
 * Logs in a user.
 */
export const loginUser = async (email, password) => {
  try {
    //SANITIZATION
    const cleanEmail = email?.toLowerCase().trim();

    if (!cleanEmail || !password) {
      const code = "auth/missing-credentials";
      throw new appError(AUTH_ERROR_MESSAGES[code], true, code);
    }

    //PERSISTENCE
    await setPersistence(auth, browserSessionPersistence);
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const uid = userCredential.user.uid;

    // Reset attempts on successful login using consistent tracking ID
    const trackingId = sanitizeForFirebaseKey(cleanEmail);
    await update(ref(db, `login-attempts/${trackingId}`), { count: 0, lockoutUntil: 0 });

    // Verify system status before allowing the session to continue
    const userData = await getFullUserData(uid, userCredential.user);

    if (userData.status === "disabled") {
      await signOut(auth);
      throw new appError(
        "Your account is suspended. Please contact support.",
        true,
        "auth/account-suspended"
      );
    }

    return {
      user: userCredential.user,
      userData: { ...userData, uid },
    };
  } catch (error) {
    if (error instanceof appError) throw error;

    const errorCode = [
      "auth/user-not-found",
      "auth/wrong-password",
      "auth/invalid-credential",
    ].includes(error.code)
      ? "auth/invalid-credential"
      : error.code || "default";

    throw new appError(
      AUTH_ERROR_MESSAGES[errorCode] || AUTH_ERROR_MESSAGES.default,
      true,
      errorCode
    );
  }
};

/**
 * SECURE LOGOUT SERVICE
 */
export const logoutUser = async () => {
  try {
    //FIREBASE SIGNOUT
    await signOut(auth);

    sessionStorage.removeItem("pending_uid");

    localStorage.removeItem("last_activity");

    return { success: true };
  } catch {
    throw new appError(
      "Security Check: Failed to securely terminate the session.",
      true,
      "auth/logout-failed"
    );
  }
};

/**
 * Retrieves custom claims from the current user's ID token.
 * This is the authoritative source for RBAC roles.
 */
export const getUserClaims = async (user, forceRefresh = false) => {
  if (!user) return null;
  try {
    const idTokenResult = await user.getIdTokenResult(forceRefresh);
    return idTokenResult.claims;
  } catch (error) {
    logger.error("Failed to fetch ID token claims:", error);
    return null;
  }
};

export const subscribeToAuthChanges = (callback) => {
  if (typeof callback !== "function") {
    throw new appError("Auth Callback must be a function.", true, "auth/invalid-callback");
  }
  return onAuthStateChanged(auth, callback);
};

// Fetches complete user context from normalized nodes.

export const getFullUserData = async (uid, firebaseUser = null, forceRefresh = false) => {
  if (!uid) throw new appError("User ID is required.", true, "auth/missing-uid");

  try {
    // 1. Fetch token claims if firebaseUser is provided (Authoritative RBAC)
    let claims = null;
    if (firebaseUser) {
      const tokenResult = await firebaseUser.getIdTokenResult(forceRefresh);
      claims = tokenResult.claims;
    }

    // 2. Fetch all three DB sources in parallel for speed
    const snaps = await Promise.all([
      get(ref(db, `users/${uid}`)),
      get(ref(db, `roles/${uid}`)),
      get(ref(db, `accounts/${uid}`)),
    ]);

    const [userSnap, roleSnap, accountSnap] = snaps;
    const roleData = roleSnap.val() || {};
    const profile = userSnap.val() || {};
    const account = accountSnap.val() || {};

    // 3. Determine the authoritative role
    // Prefer Token Claims if available, otherwise fallback to DB (for initial provisioning/sync)
    const tokenRole = claims?.superAdmin
      ? ROLES.SUPER_ADMIN
      : claims?.admin
        ? ROLES.ADMIN
        : claims?.role;
    const finalRole = tokenRole || roleData.role || ROLES.RESIDENT;

    return {
      uid,
      ...profile,
      role: finalRole,
      status: account.status || "active",
      requiresPasswordChange: account?.requiresPasswordChange || false,
      isPrivate: roleData?.isPrivate || false,
      updatedAt: roleData?.updatedAt || Date.now(),
      claims, // Include raw claims for secondary checks
    };
  } catch (error) {
    if (error instanceof appError) throw error;
    const errorCode = error.code || "default";
    throw new appError(
      AUTH_ERROR_MESSAGES[errorCode] || AUTH_ERROR_MESSAGES.default,
      true,
      errorCode
    );
  }
};

/**
 * RESETS user password using a verified OTP.
 * This calls a secure backend function to bypass client-side restrictions.
 */
export const resetUserPasswordWithOTP = async (email, newPassword, otp) => {
  try {
    const response = await fetch("/api/resetPassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword, otp }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new appError(
        result.error || "Failed to reset password. Please try again.",
        true,
        result.code || "auth/reset-failed"
      );
    }

    return result;
  } catch (error) {
    if (error instanceof appError) throw error;
    logger.error("Reset Password Error:", error);
    throw new appError(
      "The security service is currently unavailable. Please try again later.",
      true,
      "auth/reset-service-error"
    );
  }
};
