import { sendSuccess, sendError, handleOptions } from "../_utils/response.js";
import {
  getPendingOutboxEntries,
  markOutboxSynced,
  updateOutboxAttempt,
  getOutboxPath,
} from "../_utils/outbox.js";
import { isSmsDispatchPaused } from "../_utils/sms_control.js";
import axios from "axios";
import crypto from "crypto";
import { initFirebaseAdmin } from "../_utils/firebase.js";

/**
 * Vercel Serverless Function: retry_outbox
 * Triggered by Vercel Cron to retry unsynced SMS alerts.
 * Authentication: Authorization: Bearer ***
 */
export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  // 1. Native Vercel Cron Authentication
  const authHeader = req.headers["authorization"];
  const expectedSecret = process.env.CRON_SECRET;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "Unauthorized cron access.", 401, "sms/retry/unauthorized");
  }

  const providedToken = authHeader.split("Bearer ")[1];

  if (!expectedSecret) {
    console.error("[smsRetry] CRON_SECRET not configured in environment.");
    return sendError(res, "Internal server configuration error.", 500, "sms/retry/config-missing");
  }

  // Timing-safe comparison to prevent side-channel attacks
  const providedBuffer = Buffer.from(providedToken);
  const expectedBuffer = Buffer.from(expectedSecret);

  if (providedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
    return sendError(res, "Unauthorized cron access.", 401, "sms/retry/unauthorized");
  }

  try {
    const paused = await isSmsDispatchPaused();
    if (paused) {
      return sendSuccess(res, { processed: 0, status: "paused" });
    }

    // --- Concurrency Control (Lease Lock) ---
    const { db } = initFirebaseAdmin();

    const now = Date.now();
    const LOCK_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

    const isE2E = process.env.E2E_MODE === 'true';
    const lockPath = isE2E ? "system_metadata_e2e/sms_retry_lock" : "system_metadata/sms_retry_lock";

    const lockId = crypto.randomUUID();
    const lockAcquired = await db.ref(lockPath).transaction((current) => {
      if (current === null) return { owner: lockId, timestamp: now };

      const timestamp = typeof current === "number" ? current : current.timestamp;
      if (timestamp && now - timestamp > LOCK_TIMEOUT_MS) {
        return { owner: lockId, timestamp: now };
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
        if (entry.createdAt && now - entry.createdAt > STALE_THRESHOLD_MS) {
          console.warn(`[smsRetry] Alert ${eventId} is stale. Marking as expired.`);
          await db.ref(getOutboxPath(eventId)).update({ status: "expired" });
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
          console.error(`[smsRetry] Failed to retry ${eventId}: [REDACTED ERROR]`);
        }
      }

      return sendSuccess(res, { processed: processedCount, status: "batch_complete" });
    } finally {
      // Atomic release: only remove if we are still the owner
      await db.ref(lockPath).transaction((current) => {
        if (current && current.owner === lockId) {
          return null;
        }
        return;
      });
    }
  } catch (error) {
    return sendError(res, error, 500, "sms/retry/internal-error");
  }
}
