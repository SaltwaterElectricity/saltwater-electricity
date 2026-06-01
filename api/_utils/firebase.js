import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";

/**
 * Initializes Firebase Admin SDK if not already initialized.
 * Returns an object containing the auth and database instances.
 */
export function initFirebaseAdmin() {
  if (!getApps().length) {
    // Strictly use non-prefixed variables for backend secrets
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID; // projectId is okay to have VITE_ as it's not a secret
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const databaseURL = process.env.VITE_FIREBASE_DATABASE_URL; // databaseURL is also not a secret

    if (!projectId || !clientEmail || !privateKey) {
      console.error(
        "[Firebase Admin] Critical: Missing configuration variables (CLIENT_EMAIL or PRIVATE_KEY)."
      );
      throw new Error("Missing Firebase Admin credentials (CLIENT_EMAIL or PRIVATE_KEY).");
    }

    try {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n"),
        }),
        databaseURL,
      });
      console.warn("[Firebase Admin] Initialized successfully.");
    } catch (error) {
      console.error("[Firebase Admin] Initialization failed:", error.message);
      throw error;
    }
  }

  return {
    auth: getAuth(),
    db: getDatabase(),
  };
}
