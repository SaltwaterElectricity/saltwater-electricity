
with open('api/admin/generateToken.js', 'w', encoding='utf-8') as f:
    f.write('''import { initFirebaseAdmin } from "../_utils/firebase.js";
import { sendSuccess, sendError, handleOptions } from "../_utils/response.js";
import { enforceAccountSecurity } from "../_utils/security.js";
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
    
    // 1. Authentication and Account Status Check
    const security = await enforceAccountSecurity(req, res, { auth, db });
    if (!security.authorized) {
      return sendError(res, security.message || "Unauthorized", security.status, security.code);
    }
    
    const uid = security.uid;

    // 2. SuperAdmin Role Verification
    const roleSnap = await db.ref(`roles/${uid}`).get();
    const userRole = roleSnap.exists() ? roleSnap.val().role : null;

    if (userRole !== "superAdmin") {
      console.warn(`[SECURITY] Unauthorized generateToken attempt by user: ${uid} (Role: ${userRole})`);
      return sendError(res, "Forbidden: SuperAdmin access required.", 403, "auth/forbidden");
    }

    // 3. Token Generation
    const { durationHours = 24 } = req.body || {};
    const token = crypto.randomBytes(16).toString("hex");
    const hash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = Date.now() + durationHours * 60 * 60 * 1000;

    await db.ref(`enrollment_tokens/${hash}`).set({
      consumed: false,
      expiresAt: expiresAt,
      createdAt: Date.now(),
      createdBy: uid, // Bind to the actual SuperAdmin UID
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
