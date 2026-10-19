import { initFirebaseAdmin } from "../_utils/firebase.js";
import { sendSuccess, sendError, handleOptions } from "../_utils/response.js";
import crypto from "crypto";

/**
 * Vercel Serverless Function: smsWebhook
 * Handles delivery status updates from UniSMS.
 */
export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    return sendError(res, "Method Not Allowed", 405, "sms/webhook/method-not-allowed");
  }

  // 1. Authentication (FAIL CLOSED)
  const providedSecret = req.headers["webhook-secret-key"];
  const expectedSecret = process.env.UNISMS_WEBHOOK_SECRET;

  if (!providedSecret || !expectedSecret) {
    return sendError(res, "Unauthorized webhook request.", 401, "sms/webhook/unauthorized");
  }

  try {
    const providedBuffer = Buffer.from(providedSecret);
    const expectedBuffer = Buffer.from(expectedSecret);

    if (providedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
      return sendError(res, "Unauthorized webhook request.", 401, "sms/webhook/unauthorized");
    }
  } catch {
    return sendError(res, "Unauthorized webhook request.", 401, "sms/webhook/unauthorized");
  }

  // 2. Payload Validation (FAIL CLOSED)
  const payload = req.body;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return sendError(res, "Invalid request body.", 400, "sms/webhook/invalid-body");
  }

  const { id, event } = payload;
  
  const EVENT_STATUS_MAP = {
    'message.sent': 'provider_accepted',
    'message.delivered': 'delivered',
    'message.failed': 'failed',
    'message.retrying': 'submitting',
  };

  const supportedEvents = Object.keys(EVENT_STATUS_MAP);

  if (typeof id !== 'string' || id.trim().length === 0) {
    return sendError(res, 'Missing or invalid message ID.', 400, 'sms/webhook/invalid-id');
  }

  if (typeof event !== 'string' || !supportedEvents.includes(event)) {
    return sendError(res, 'Missing or unsupported event type.', 400, 'sms/webhook/invalid-event');
  }

  const { db } = initFirebaseAdmin();
  const eventId = crypto.createHash("sha256").update(`${id}|${event}`).digest("hex");
  const providerRefId = id;


  try {
    // 2. Durable Receipt Ledger (Idempotency)
    const receiptRef = db.ref(`webhooks_pending/${eventId}`);

    // Transactional claim of the receipt with Lease Recovery
    const ownershipToken = crypto.randomUUID();
    const LEASE_DURATION_MS = 5 * 60 * 1000; // 5 Minutes
    const now = Date.now();

    const claimSuccess = await receiptRef.transaction((current) => {
      if (current?.applied) return; // Already fully processed
      
      // Reclaim if lease expired, regardless of state (processing or updating)
      if (current && now < current.leaseExpiresAt && current.ownerToken !== ownershipToken) return;
      
      return { 
        state: 'processing', 
        timestamp: now, 
        leaseExpiresAt: now + LEASE_DURATION_MS, 
        ownerToken: ownershipToken,
        authoritativeStatus: EVENT_STATUS_MAP[event],
        providerRefId: providerRefId, // Required for reconciliation
        userId: payload.userId || 'unknown', // Required for projection
      };
    });

    if (!claimSuccess.committed) {
      return sendSuccess(res, { status: "already_processed" });
    }

    // 3. Provider-Reference Mapping & Recovery
    let msgId = null;
    const indexRef = db.ref(`sms_provider_index/${providerRefId}`);
//@C_S_I_S:C_S_I_S
    const indexSnap = await indexRef.get();

    if (indexSnap.exists()) {
      msgId = indexSnap.val().msgId;
    } else {
      // RECOVERY: Reverse lookup on queue if index is missing
      const queueRef = db.ref("sms_queue_v2");
      const reverseLookup = await queueRef
        .orderByChild("providerRefId")
        .equalTo(providerRefId)
        .once("value");

      if (reverseLookup.exists()) {
        const records = reverseLookup.val();
        const firstMatch = Object.keys(records)[0];
        msgId = firstMatch;
        // Restore the index
        await indexRef.set({ msgId });
      }
    }

    if (!msgId) {
      // Route to audit log for unresolved references
      await db.ref("sms_audit_logs").push({
        type: "UNRESOLVED_WEBHOOK",
        payload,
        timestamp: Date.now()
      });
      return sendSuccess(res, { status: "unresolved_reference" });
    }

    // 3. Monotonic Projection
    const statusRef = db.ref(`sms_status/${payload.userId || 'unknown'}/${msgId}`);
    const stateWeights = {
      'queued': 0,
      'claimed': 1,
      'submitting': 2,
      'provider_accepted': 3,
      'delivered': 4,
      'failed': 4,
      'prov_acc_unknown': 3
    };

    // Step A: Mark receipt as 'updating' before projection
    const transitionSuccess = await receiptRef.transaction((current) => {
      if (!current || current.ownerToken !== ownershipToken) return;
      return { ...current, state: 'updating' };
    });

    if (!transitionSuccess.committed) {
      return sendSuccess(res, { status: 'superseded' });
    }

    // Step B: Project stored authoritative status monotonically
    const receiptSnap = await receiptRef.get();
    const statusToProject = receiptSnap.val()?.authoritativeStatus || EVENT_STATUS_MAP[event];

    await statusRef.transaction((current) => {
      const currentStatus = current?.status || 'queued';
      if (stateWeights[statusToProject] > stateWeights[currentStatus]) {
        return {
          status: statusToProject,
          updatedAt: Date.now(),
          lastEvent: event
        };
      }
      return; 
    });

    // Step C: Finalize Receipt
    const finalizationSuccess = await receiptRef.transaction((current) => {
      if (!current || current.ownerToken !== ownershipToken) return;
      return { ...current, applied: true, state: 'applied' };
    });

    if (!finalizationSuccess.committed) {
      console.warn(`[smsWebhook] Attempt ${ownershipToken} superseded by newer claim.`);
      return sendSuccess(res, { status: 'superseded' });
    }

    return sendSuccess(res, { status: 'processed', msgId });

  } catch (error) {
    console.error("[smsWebhook] Error processing event:", error);
    return sendError(res, error, 500, "sms/webhook/internal-error");
  }
}
