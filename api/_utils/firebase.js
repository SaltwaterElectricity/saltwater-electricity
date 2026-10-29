import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";

export function initFirebaseAdmin() {
  if (!getApps().length) {
    if (process.env.FIREBASE_DATABASE_EMULATOR_HOST) {
      const emulatorHost = process.env.FIREBASE_DATABASE_EMULATOR_HOST;
      const emulatorUrl = process.env.FIREBASE_DATABASE_URL || `https://${process.env.FIREBASE_PROJECT_ID || 'test-project'}.firebaseio.com`;

      initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || "test-project",
        databaseURL: emulatorUrl,
      });
      process.env.FIREBASE_DATABASE_EMULATOR_HOST = emulatorHost;
    } else {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;
      const databaseURL = process.env.FIREBASE_DATABASE_URL;

      if (process.env.VERCEL_ENV === "preview") {
        if (projectId !== "saltwater-electricity-staging") {
          throw new Error("[SECURITY] Production project ID detected in Preview environment.");
        }
        const expectedStagingUrl = "https://saltwater-electricity-staging-default-rtdb.asia-southeast1.firebasedatabase.app";
        if (databaseURL !== expectedStagingUrl) {
          throw new Error("[SECURITY] Preview isolation failure: Database URL mismatch.");
        }
      }

      if (!projectId || !clientEmail || !privateKey) {
        throw new Error("Missing Firebase Admin credentials (CLIENT_EMAIL or PRIVATE_KEY).");
      }


        initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\\\n/g, "\\n"),
          }),
          databaseURL,
        });

    }
  }
  if (process.env.FIREBASE_DATABASE_EMULATOR_HOST) {
    process.env.FIREBASE_DATABASE_EMULATOR = "true";
  }
  return {
    auth: getAuth(),
    db: getDatabase(),
  };
}
