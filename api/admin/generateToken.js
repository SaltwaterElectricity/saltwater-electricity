import { initFirebaseAdmin } from "./_utils/firebase.js";
import crypto from "crypto";

async function generateToken(durationHours = 24) {
  const { db } = initFirebaseAdmin();
  const token = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = Date.now() + (durationHours * 60 * 60 * 1000);

  await db.ref(`enrollment_tokens/${hash}`).set({
    consumed: false,
    expiresAt: expiresAt,
    createdAt: Date.now(),
    createdBy: "admin-tool"
  });

  console.warn("--------------------------------------------------");
  console.warn("PROVISIONING TOKEN GENERATED");
  console.warn(`Token: ${token}`);
  console.warn(`Expires at: ${new Date(expiresAt).toISOString()}`);
  console.warn("--------------------------------------------------");
  console.warn("IMPORTANT: Deliver this token securely to the device.");
  console.warn("Do not store this token in shared logs or version control.");
}

generateToken().catch(console.error);

