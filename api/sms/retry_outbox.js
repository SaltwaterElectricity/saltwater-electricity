import { sendSuccess, sendError, handleOptions } from "./_utils/response.js";
import {
  getPendingOutboxEntries,
  markOutboxSynced,
  updateOutboxAttempt,
} from "../_utils/outbox.js";
import { isSmsDispatchPaused } from "../_utils/sms_control.js";
import axios from "axios";
import { initFirebaseAdmin } from "../_utils/firebase.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  // Simple auth for the cron job
  const cronSecret = req.headers["x-cron-secret"];
  if (!cronSecret || cronSecret !== process.env.SMS_RETRY_CRON_SECRET) {
    return sendError(res, "Unauthorized cron access.", 401, "sms/retry/unauthorized");
  }

  try {
    const paused = await isSmsDispatchPaused();
    if (paused) {
      return sendSuccess(res, { processed: 0, status: "paused" });
    }

    // --- Concurrency Control (Lease Lock) ---
    const { db } = initFirebaseAdmin();
    const lockRef = db.ref("system_metadata/sms_retry_lock");
    const now = Date.now();
    const LOCK_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

    const lockAcquired = await db.ref("system_metadata/sms_retry_lock").transaction((current) => {
      if (current === null || (now - current < 0 || now - current > LOCK_TIMEOUT_MS)) {
        return now;
      }
      return;
    });

    if (!lockAcquired.committed) {
      return sendSuccess(res, { processed: 0, status: "locked" });
    }

    try {
      const pending = await getPendingOutboxEntries(20);
      if (!pending) {
        return sendSuccess(res, { processed: 0, status: "no_pending" });
      }

      const entries = Object.entries(pending.val() || {});
      let processedCount = 0;
      const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

      for (const [eventId, entry] of entries) {
        // --- Staleness Check ---
        if (entry.createdAt && (now - entry.createdAt > STALE_THRESHOLD_MS)) {
          console.warn(`[smsRetry] Alert ${eventId} is stale. Marking as expired.`);
          await db.ref(`hardware_alert_outbox/${eventId}`).update({ status: "expired" });
          continue;
        }

        try {
          const response = await axios.post(
            process.env.SMS_API_INGEST_URL,
            {
              number: entry.number,
              message: entry.message,
              deviceId: entry.deviceId,
              eventId: eventId,
            },
            {
              headers: { "x-api-key": process.env.SMS_API_KEY },
              timeout: 5000,
            }
          );

          if (response.status === 200 || response.status === 202) {
            await markOutboxSynced(eventId);
            processedCount++;
          }
        } catch (error) {
          await updateOutboxAttempt(eventId, error);
          console.error(`[smsRetry] Failed to retry ${eventId}:`, error.message);
        }
      }

      return sendSuccess(res, { processed: processedCount, status: "batch_complete" });
    } finally {
      // Release lock
      await lockRef.remove();
    }
  } catch (error) {
    return sendError(res, error, 500, "sms/retry/internal-error");
  }
}
