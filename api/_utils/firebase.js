import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";

/**
 * Initializes Firebase Admin SDK if not already initialized.
 * Returns an object containing the auth and database instances.
 */
export function initFirebaseAdmin() {
  if (!getApps().length) {
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        "Missing Firebase Admin credentials (PROJECT_ID, CLIENT_EMAIL, or PRIVATE_KEY)."
      );
    }

    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
      databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
    });
  }

  return {
    auth: getAuth(),
    db: getDatabase(),
  };
}
