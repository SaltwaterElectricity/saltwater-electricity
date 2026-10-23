import { sendSuccess, sendError, handleOptions } from "./_utils/response.js";
import {
  getPendingOutboxEntries,
  markOutboxSynced,
  updateOutboxAttempt,
} from "../_utils/outbox.js";
import axios from "axios";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  // Simple auth for the cron job
  const cronSecret = req.headers["x-cron-secret"];
  if (!cronSecret || cronSecret !== process.env.SMS_RETRY_CRON_SECRET) {
    return sendError(res, "Unauthorized cron access.", 401, "sms/retry/unauthorized");
  }

  try {
    const pending = await getPendingOutboxEntries(20);
    if (!pending) {
      return sendSuccess(res, { processed: 0, status: "no_pending" });
    }

    const entries = Object.entries(pending.val() || {});
    let processedCount = 0;

    for (const [eventId, entry] of entries) {
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
  } catch (error) {
    return sendError(res, error, 500, "sms/retry/internal-error");
  }
}
