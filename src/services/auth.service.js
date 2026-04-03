import { auth, db, FIREBASE_CONFIG } from "../firebaseConfig";
import { ref, get, update, serverTimestamp } from "firebase/database";
import { initializeApp, deleteApp } from "firebase/app";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  setPersistence, 
  browserLocalPersistence,
  getAuth,
  updatePassword 
} from "firebase/auth";

import { generateDefaultPassword } from "../utils/passwordGenerator";
import { sendOnboardingEmail } from "./email.service"

/**
 * ERROR MAPPER: Centralized for all auth actions.
 */
export const AUTH_ERROR_MESSAGES = Object.freeze({
  "auth/email-already-in-use": "This email is already registered in the system.",
  "auth/invalid-email": "The email address format is not valid.",
  "auth/weak-password": "Security Check: Password must be at least 8 characters and include numbers/symbols.",
  "auth/user-not-found": "Invalid email or password. Please try again.", 
  "auth/wrong-password": "Invalid email or password. Please try again.", 
  "auth/invalid-credential": "Invalid email or password. Please try again.", 
  "auth/missing-credentials": "Email and password are required.",
  "auth/requires-recent-login": "Security timeout. Please re-verify your identity again.",
  "auth/network-request-failed": "Connection Error: Please check the facility's internet stability.",
  "db/permission-denied": "Security Check: You do not have permission to access this data.",
  "db/unavailable": "The database is currently offline. Please check your connection.",
  "default": "An unexpected authentication error occurred."
});

export const validateEmail = (email) => {
  // Mas matibay kaysa sa .includes("@"). Sinisiguro nito ang format na: user@domain.com
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email || !emailRegex.test(email)) {
    throw new Error(AUTH_ERROR_MESSAGES["auth/invalid-email"] || "A valid email is required.");
  }
};

export const validatePassword = (password) => {
  // 1. LENGTH CHECK (Minimum 8 characters)
  if (!password || password.length < 8) {
    throw new Error(AUTH_ERROR_MESSAGES["auth/weak-password"] || "Security Check: Password must be at least 8 characters.");
  }

  const complexityRegex = /^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/;
  
  if (!complexityRegex.test(password)) {
    // Maaari mong gawing mas descriptive ang message sa loob ng AUTH_ERROR_MESSAGES object
    throw new Error(AUTH_ERROR_MESSAGES["auth/weak-password"] || "Security Check: Password must include at least one number and one special character.");
  }
};

/**
 * FINALIZED: Updates password for the current user.
 */

export const changeUserPassword = async (newPassword, currentPassword = null, isForceReset = false) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("Session expired. Please log in again.");

  validatePassword(newPassword);

  try {
    // 🛡️ SECURITY CHECK: Kung hindi force reset, kailangan ng re-authentication
    if (!isForceReset) {
      if (!currentPassword) throw new Error("Current password is required for profile updates.");
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

    sessionStorage.removeItem("is_verified");

    return { success: true };
  } catch (error) {
    // 🔍 Pro-tip: Mas maganda kung itatapon mo ang native Firebase code para mahuli ng AUTH_ERROR_MESSAGES object mo sa UI.
    throw {
      code: error.code || "default",
      message: error.message || "Security system encountered an error updating credentials."
    };
  }
};

/**
 * Registers a new user account.
 */

export const registerUserAccount = async (userData) => {
  const { email, firstName, role } = userData;
  let tempApp = null;

  try {
    validateEmail(email);

    const autoPassword = generateDefaultPassword();

    const appName = `TempApp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    tempApp = initializeApp(FIREBASE_CONFIG, appName);
    const tempAuth = getAuth(tempApp);

    // 5. ATOMIC ACCOUNT CREATION
    const userCredential = await createUserWithEmailAndPassword(tempAuth, email, autoPassword);
    const uid = userCredential.user.uid;

    // 6. SECURE CREDENTIAL DELIVERY (EmailJS)
    let emailSent = false;
    try {
      await sendOnboardingEmail({ email, firstName, role }, autoPassword);
      emailSent = true;
    } catch (emailError) {
      emailSent = false;
    }

    //Memory Management
    await deleteApp(tempApp);
    tempApp = null;

    //MINIMAL DATA RETURN
    return {
      uid,
      tempPassword: autoPassword,
      emailSent
    };

  } catch (error) {
    // EMERGENCY CLEANUP
    if (tempApp) {
      try { await deleteApp(tempApp); } catch (e) { /* silent cleanup fail */ }
    }

    // ERROR MASKING
    const message = AUTH_ERROR_MESSAGES[error.code] || AUTH_ERROR_MESSAGES.default;
    throw new Error(message);
  }
};

/**
 * Logs in a user.
 */
export const loginUser = async (email, password) => {
  try {
    //SANITIZATION
    const cleanEmail = email?.toLowerCase().trim();
    
    if (!cleanEmail || !password) { throw { code: "auth/missing-credentials" }; }

    //PERSISTENCE
    await setPersistence(auth, browserLocalPersistence);
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const uid = userCredential.user.uid;

    // Verify system status before allowing the session to continue
    const userData = await getFullUserData(uid);
    
    if (userData.status === "disabled") {
      await signOut(auth);
      sessionStorage.removeItem("is_verified");
      throw new Error("Your account is suspended. Please contact support.");
    }
    
    sessionStorage.setItem("is_verified", "true");
    return { 
      user: userCredential.user, 
      userData: { ...userData, uid }
    };

  } catch (error) {
    sessionStorage.removeItem("is_verified");
    const errorCode = ["auth/user-not-found", "auth/wrong-password", "auth/invalid-credential"].includes(error.code) 
      ? "auth/invalid-credential" 
      : error.code;

    throw new Error(AUTH_ERROR_MESSAGES[errorCode] || AUTH_ERROR_MESSAGES.default);
  }
};

/**
 * SECURE LOGOUT SERVICE
 */
export const logoutUser = async () => {
  try {

    //FIREBASE SIGNOUT
    await signOut(auth);

    sessionStorage.removeItem("is_verified");
    sessionStorage.removeItem("pending_uid");

    localStorage.removeItem("last_activity");
    
    return { success: true };
  } catch (error) {
    throw new Error("Security Check: Failed to securely terminate the session.");
  }
};

export const subscribeToAuthChanges = (callback) => {
  if (typeof callback !== "function") {
    throw new Error("Auth Callback must be a function.");
  }
  return onAuthStateChanged(auth, callback);
};

// Fetches complete user context from normalized nodes.
 
export const getFullUserData = async (uid) => {
  if (!uid) throw new Error("User ID is required.");

  try {
    // Fetch all three sources in parallel for speed
    const snaps = await Promise.all([
      get(ref(db, `users/${uid}`)),
      get(ref(db, `roles/${uid}`)),
      get(ref(db, `accounts/${uid}`))
    ]);

    const [userSnap, roleSnap, accountSnap] = snaps;
    const roleData = roleSnap.val() || {}; 
    const profile = userSnap.val() || {};
    const account = accountSnap.val() || {};
    
    // Combine everything into one clean object
    return {
      uid,
      ...profile, // firstName, lastName, email, etc.
      role: roleData.role || "user",
      status: account.status || "active",
      requiresPasswordChange: account?.requiresPasswordChange || false,
      isPrivate: roleData?.isPrivate || false,
      updatedAt: roleData?.updatedAt || Date.now()
    };

  } catch (error) {
    const errorCode = error.code || error.message || "default";
    throw new Error(AUTH_ERROR_MESSAGES[errorCode] || AUTH_ERROR_MESSAGES.default);
  }
};