import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
<<<<<<< HEAD
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { appError } from "./utils/appError";
=======
import { getAuth } from "firebase/auth"; 
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a

export const FIREBASE_CONFIG = Object.freeze({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
<<<<<<< HEAD
=======
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  onboardingTemplateId: import.meta.env.VITE_EMAILJS_ONBOARDING_TEMPLATE_ID,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  otpTemplateId: import.meta.env.VITE_EMAILJS_OTP_TEMPLATE_ID
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
});

// Safety Check: Validate critical variables
if (!FIREBASE_CONFIG.apiKey || !FIREBASE_CONFIG.databaseURL) {
<<<<<<< HEAD
  throw new appError(
    "Firebase Environment Variables missing. Check your .env file.",
    false,
    "config/missing-env"
  );
=======
  throw new Error("Firebase Environment Variables missing. Check your .env file.");
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
}

// Singleton Pattern
const app = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG);

// Export Instances
export const auth = getAuth(app);
export const db = getDatabase(app);
<<<<<<< HEAD
export const functions = getFunctions(app);

export default app;
=======

export default app;
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
