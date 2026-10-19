import { initFirebaseAdmin } from "../_utils/firebase.js";
import { sendSuccess, sendError, handleOptions } from "../_utils/response.js";
import crypto from "crypto";

/**
 * Vercel Serverless Function: smsReconcile
 * Recovers incomplete webhook receipts by re-projecting authoritative status.
 */
export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    return sendError(res, "Method Not Allowed", 405, "sms/reconcile/method-not-allowed");
  }

  // 1. Authentication (Internal Secret)
  const providedSecret = req.headers["x-reconcile-secret"];
  const expectedSecret = process.env.SMS_RECONCILE_SECRET;

  if (!providedSecret || !expectedSecret) {
    return sendError(res, "Unauthorized reconciliation request.", 401, "sms/reconcile/unauthorized");
  }

  try {
    const providedBuffer = Buffer.from(providedSecret);
    const expectedBuffer = Buffer.from(expectedSecret);
    if (providedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
      return sendError(res, "Unauthorized reconciliation request.", 401, "sms/reconcile/unauthorized");
    }
  } catch {
    return sendError(res, "Unauthorized reconciliation request.", 401, "sms/reconcile/unauthorized");
  }

  const { db } = initFirebaseAdmin();
  const now = Date.now();
  const BATCH_LIMIT = 50;
  const LEASE_DURATION_MS = 5 * 60 * 1000; // 5 Minutes

  try {
    // 2. Discover Incomplete Receipts
    // We query for records where lease has expired.
    // Note: In Production, an index on leaseExpiresAt is required.
    const pendingRef = db.ref("webhooks_pending");
    const snapshot = await pendingRef
      .orderByChild("leaseExpiresAt")
      .endAt(now)
      .limitToFirst(BATCH_LIMIT)
      .once("value");

    const records = snapshot.val();
    if (!records) {
      return sendSuccess(res, { recovered: 0, status: "no_stale_receipts" });
    }

    const recordIds = Object.keys(records);
    let recoveredCount = 0;
    const results = [];

    const stateWeights = {
      "queued": 0,
      "claimed": 1,
      "submitting": 2,
      "provider_accepted": 3,
      "delivered": 4,
      "failed": 4,
      "prov_acc_unknown": 3
    };

    for (const eventId of recordIds) {
      const receipt = records[eventId];
      
      // Skip already applied
      if (receipt.applied) continue;

      // 3. Recover authoritative status
      const authStatus = receipt.authoritativeStatus;
      if (!authStatus) {
        results.push({ eventId, error: "Missing authoritativeStatus" });
        continue;
      }

      // Find the message ID (via index or reverse lookup)
      // We need a way to map the eventId/receipt to a msgId.
      // Since we don't store msgId in the receipt, we have to derive it.
      // The receipt ID is SHA256(id|event). We have 'id' in the provider reference.
      // Wait, the receipt doesn't store the original provider ID.
      // CORRECTION: We must store providerRefId in the receipt during claim.
      // (Since I already patched webhook.js, I should check if I added providerRefId. 
      // I didn't. I need to update webhook.js to store providerRefId in the receipt).
      
      // Assuming providerRefId is available in the receipt (after we patch it):
      const providerRefId = receipt.providerRefId;
      if (!providerRefId) {
        results.push({ eventId, error: "Missing providerRefId" });
        continue;
      }

      const indexRef = db.ref(`sms_provider_index/${providerRefId}`);
      const indexSnap = await indexRef.get();
      const msgId = indexSnap.exists() ? indexSnap.val().msgId : null;

      if (!msgId) {
        results.push({ eventId, error: "Unresolved provider reference" });
        continue;
      }

      // 4. Monotonic Projection
      const statusRef = db.ref(`sms_status/${receipt.userId || 'unknown'}/${msgId}`);
      
      // We use a fresh owner token for the reconciliation process
      const recoveryToken = crypto.randomUUID();
      const receiptRef = db.ref(`webhooks_pending/${eventId}`);

      // Claim for recovery
      const claimSuccess = await receiptRef.transaction((current) => {
        if (!current || current.applied) return;
        // Only claim if lease is expired
        if (now < current.leaseExpiresAt) return;
        return { ...current, state: "processing", ownerToken: recoveryToken, leaseExpiresAt: now + LEASE_DURATION_MS };
      });

      if (!claimSuccess.committed) continue;

      await statusRef.transaction((current) => {
        const currentStatus = current?.status || "queued";
        if (stateWeights[authStatus] > stateWeights[currentStatus]) {
          return {
            status: authStatus,
            updatedAt: Date.now(),
            lastEvent: "reconciliation"
          };
        }
        return;
      });

      // Finalize
      await receiptRef.update({ applied: true, state: "applied" });
      recoveredCount++;
    }

    return sendSuccess(res, {
      recovered: recoveredCount,
      totalProcessed: recordIds.length,
      details: results
    });
  } catch (error) {
    console.error("[smsReconcile] Error:", error);
    return sendError(res, error, 500, "sms/reconcile/internal-error");
  }
}
