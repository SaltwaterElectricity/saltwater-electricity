import { initFirebaseAdmin } from "./firebase.js";

/**
 * Checks if SMS dispatch is globally paused in the system metadata.
 * Defaults to paused (fail-closed) if the state is unreadable or missing.
 * 
 * @returns {Promise<boolean>} True if paused, false if active.
 */
export async function isSmsDispatchPaused() {
  try {
    const { db } = initFirebaseAdmin();
    const snap = await db.ref("system_metadata/sms_dispatch_paused").get();
    
    if (!snap.exists()) {
      console.warn("[smsControl] sms_dispatch_paused flag missing; failing closed (paused).");
      return true;
    }
    
    const paused = snap.val();
    if (typeof paused !== 'boolean') {
      console.warn(`[smsControl] sms_dispatch_paused has invalid type ${typeof paused}; failing closed (paused).`);
      return true;
    }
    
    return paused;
  } catch (error) {
    console.error("[smsControl] Error reading sms_dispatch_paused state:", error);
    return true; // Fail closed
  }
}
