
with open('api/admin/generateToken.js', 'w', encoding='utf-8') as f:
    f.write('''import { initFirebaseAdmin } from "../_utils/firebase.js";
import { sendSuccess, sendError, handleOptions } from "../_utils/response.js";
import crypto from "crypto";

/**
 * Vercel Serverless Function: generateToken
 * Generates a provisioning token for hardware enrollment.
 * Access: SuperAdmin only.
 */
export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    return sendError(res, "Method Not Allowed", 405, "auth/method-not-allowed");
  }

  try {
    const { auth, db } = initFirebaseAdmin();
    
    const { durationHours = 24 } = req.body || {};
    const token = crypto.randomBytes(16).toString("hex");
    const hash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = Date.now() + durationHours * 60 * 60 * 1000;

    await db.ref(`enrollment_tokens/${hash}`).set({
      consumed: false,
      expiresAt: expiresAt,
      createdAt: Date.now(),
      createdBy: "admin-tool",
    });

    return sendSuccess(res, {
      token,
      expiresAt: new Date(expiresAt).toISOString(),
      message: "Provisioning token generated successfully."
    });
  } catch (error) {
    console.error("[generateToken Error]:", error);
    return sendError(res, error, 500, "auth/token-generation-failed");
  }
}
''')
