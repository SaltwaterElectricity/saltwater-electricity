import { initFirebaseAdmin } from "../_utils/firebase.js";
import { sendSuccess, sendError, handleOptions } from "../_utils/response.js";
import { processQueueBatch } from "./sms.service.js";

/**
 * Vercel Serverless Function: smsWorker
 * Thin wrapper around the SMS Queue Service.
 */
export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    return sendError(res, "Method Not Allowed", 405, "sms/worker/method-not-allowed");
  }

  const workerSecret = req.headers["x-worker-secret"];
  if (!workerSecret || workerSecret !== process.env.SMS_WORKER_SECRET) {
    return sendError(res, "Unauthorized worker access.", 401, "sms/worker/unauthorized");
  }

  const { db } = initFirebaseAdmin();

  try {
    const result = await processQueueBatch(db, {
      cursor: req.body.cursor || "0",
      batchSize: 3,
      maxDurationMs: 10000,
      deadlineBufferMs: 3000,
      dryRun: req.headers["x-test-mode"] === "true",
      targetMsgId: req.body.targetMsgId,
    });

    return sendSuccess(res, {
      ...result,
      status: "batch_complete",
    });
  } catch (error) {
    return sendError(res, error, 500, "sms/worker/internal-error");
  }
}
