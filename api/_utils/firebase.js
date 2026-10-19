import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";

/**
 * Initializes Firebase Admin SDK if not already initialized.
 * Returns an object containing the auth and database instances.
 */
export function initFirebaseAdmin() {
  if (!getApps().length) {
    // EMULATOR ISOLATION: If emulator host is set, use a dummy config to bypass Production checks
    if (process.env.FIREBASE_DATABASE_EMULATOR_HOST) {
      const emulatorHost = process.env.FIREBASE_DATABASE_EMULATOR_HOST.replace('localhost', '127.0.0.1');
      const emulatorUrl = (process.env.FIREBASE_DATABASE_URL || 'http://localhost:9000').replace('localhost', '127.0.0.1');

      initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || "test-project",
        databaseURL: emulatorUrl,
      });
      process.env.FIREBASE_DATABASE_EMULATOR_HOST = emulatorHost;
    } else {

      // Production/Standard initialization
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;
      const databaseURL = process.env.FIREBASE_DATABASE_URL;

      // PREVIEW ISOLATION GUARD
      if (process.env.VERCEL_ENV === 'preview') {
        if (projectId !== 'saltwater-electricity-staging') {
          throw new Error('[SECURITY] Production project ID detected in Preview environment.');
        }
        const expectedStagingUrl = 'https://saltwater-electricity-staging-default-rtdb.asia-southeast1.firebasedatabase.app';
        if (databaseURL !== expectedStagingUrl) {
          throw new Error('[SECURITY] Preview isolation failure: Database URL mismatch.');
        }
      }


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
      } catch (error) {
        console.error("[Firebase Admin] Initialization failed:", error.message);
        throw error;
      }
    }
  }

  if (process.env.FIREBASE_DATABASE_EMULATOR_HOST) {
    process.env.FIREBASE_DATABASE_EMULATOR = "true";
  }
  const db = getDatabase();

  return {
    auth: getAuth(),
    db: db,
  };
}
