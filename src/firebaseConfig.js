import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth"; 
import { appError } from "./utils/appError";

export const FIREBASE_CONFIG = Object.freeze({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  onboardingTemplateId: import.meta.env.VITE_EMAILJS_ONBOARDING_TEMPLATE_ID,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  otpTemplateId: import.meta.env.VITE_EMAILJS_OTP_TEMPLATE_ID
});

// Safety Check: Validate critical variables
if (!FIREBASE_CONFIG.apiKey || !FIREBASE_CONFIG.databaseURL) {
  throw new appError("Firebase Environment Variables missing. Check your .env file.", false, "config/missing-env");
}

// Singleton Pattern
const app = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG);

// Export Instances
export const auth = getAuth(app);
export const db = getDatabase(app);

export default app;
