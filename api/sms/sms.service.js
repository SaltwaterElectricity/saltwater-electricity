import { v4 as uuidv4 } from "uuid";

/**
 * UniSMS Adapter
 * Isolated implementation of the external provider API.
 */
export async function submitToUniSMS(_record) {
  if (process.env.UNISMS_LIVE_SEND_ENABLED !== "true") {
    // Mocked behavior for local testing/development
    await new Promise(resolve => setTimeout(resolve, 100));
    const rand = Math.random();
    if (rand > 0.2) {
      return { status: "accepted", refId: `uni_${Math.random().toString(36).substr(2, 9)}` };
    } else if (rand > 0.1) {
      return { status: "rejected", error: "Invalid number" };
    } else {
      throw new Error("Connection reset by peer");
    }
  }

  // Real UniSMS Provider Implementation
  const axios = (await import("axios")).default;
  const apiUrl = process.env.UNISMS_API_URL || "https://unismsapi.com/api";
  const apiKey = process.env.UNISMS_API_KEY;
  const senderId = process.env.UNISMS_SENDER_ID;

  if (!apiKey || !senderId) {
    throw new Error("[SECURITY] UniSMS provider configuration missing (API_KEY or SENDER_ID).");
  }

  const authHeader = `Basic ${Buffer.from(apiKey + ":").toString("base64")}`;

  // A. Duplicate-Send Protection: Lookup existing reference
  if (_record.providerRefId) {
    try {
      const lookupRes = await axios.get(`${apiUrl}/sms/${_record.providerRefId}`, {
        headers: { "Authorization": authHeader },
        timeout: 5000,
      });
      
      if (lookupRes.status === 200) {
        const providerStatus = lookupRes.data.status; // pending, retrying, sent, failed
        if (["pending", "retrying", "sent"].includes(providerStatus)) {
          return { status: "accepted", refId: _record.providerRefId };
        }
      }
    } catch (error) {
      console.error(`[UniSMS] Lookup failed for ${_record.providerRefId}: ${error.message}`);
      return { status: "unknown", error: `Lookup failure: ${error.message}` };
    }
  }

  // B. Provider Submission
  try {
    const response = await axios.post(`${apiUrl}/sms`, {
      recipient: _record.number,
      content: _record.message,
      sender_id: senderId,
    }, {
      headers: { 
        "Authorization": authHeader,
        "Content-Type": "application/json"
      },
      timeout: 7000,
    });

    if (response.status === 201) {
      const refId = response.data.message?.reference_id;
      if (refId) {
        return { status: "accepted", refId };
      }
      return { status: "unknown", error: "Missing reference_id in 201 response" };
    }
    return { status: "unknown", error: `Provider responded with HTTP ${response.status}` };
  } catch (error) {
    if (error.response) {
      if (error.response.status === 400 || error.response.status === 422) {
        return { status: "rejected", error: `Provider rejection: ${error.response.status}` };
      }
      if (error.response.status === 429) {
        return { status: "unknown", error: "Rate limited (429)" };
      }
      return { status: "unknown", error: `Provider error: ${error.response.status}` };
    }
    if (error.code === 'ECONNABORTED') {
      return { status: "unknown", error: "Request timed out" };
    }
    throw error;
  }
}

/**
 * SMS Queue Service
 * Implements the transactional state machine for message processing.
 */
export async function finalizeMessage(db, msgId, claimToken, submissionResult, _record) {
    const queueRef = db.ref("sms_queue_v2");
    const finalUpdate = {};
    if (submissionResult.status === "accepted") {
      finalUpdate["status"] = "provider_accepted";
      finalUpdate["providerRefId"] = submissionResult.refId;
    } else if (submissionResult.status === "rejected") {
      finalUpdate["status"] = "failed";
    } else {
      finalUpdate["status"] = "prov_acc_unknown";
    }

    return await queueRef.child(msgId).transaction((current) => {
      if (!current) return null;
      if (current.claimToken !== claimToken) return;
      if (current.status !== "submitting") return;
      return { ...current, ...finalUpdate };
    });
}

export async function processQueueBatch(db, { cursor, batchSize, maxDurationMs, deadlineBufferMs }) {
  const startTime = Date.now();
  const queueRef = db.ref("sms_queue_v2");
  let processedCount = 0;

  // UNICITY INVARIANT: sortKey must be unique (e.g., timestamp_id) to prevent pagination loops.
  const snapshot = await queueRef
    .orderByChild("sortKey")
    .startAt(cursor)
    .endAt(Date.now().toString() + "_ZZZZ")
    .limitToFirst(100)
    .once("value");

  const records = snapshot.val() || {};
  const recordIds = Object.keys(records);

  let index = 0;
  for (const msgId of recordIds) {
    const record = records[msgId];
    if (index === 0 && cursor !== "0" && record.sortKey === cursor) {
      index++;
      continue;
    }
    index++;

    if (processedCount >= batchSize) break;
    if (Date.now() - startTime > (maxDurationMs - deadlineBufferMs)) break;
    const now = Date.now();
    const isPending = record.status === "pending";
    const isExpired = (record.status === "claimed" || record.status === "submitting") && record.leaseExpiresAt < now;

    if (!isPending && !isExpired) continue;

    const claimToken = uuidv4();
    const leaseDuration = 90 * 1000;
    const txnNow = Date.now();

    const claimAndSubmitSuccess = await queueRef.child(msgId).transaction((current) => {
      if (!current) return null;
      const isP = current.status === "pending";
      const isE = (current.status === "claimed" || current.status === "submitting") && current.leaseExpiresAt < txnNow;
      if (!isP && !isE) return;
      return { 
        ...current, 
        status: "submitting", 
        claimToken, 
        leaseExpiresAt: txnNow + leaseDuration,
        submissionCount: (current.submissionCount || 0) + 1 
      };
    });

    if (!claimAndSubmitSuccess.committed) continue;

    try {
      const submissionResult = await submitToUniSMS(record);
      const finalizationSuccess = await finalizeMessage(db, msgId, claimToken, submissionResult, record);

      if (finalizationSuccess.committed) {
        if (submissionResult.refId) {
          await db.ref(`sms_provider_index/${submissionResult.refId}`).set({ msgId });
        }
        processedCount++;
      }
    } catch (error) {
      console.error(`[smsWorker] Submission error for ${msgId}:`, error);
      await queueRef.child(msgId).update({ status: "prov_acc_unknown" });
    }
  }

  let nextCursor = null;
  if (recordIds.length > 0) {
    const lastRecord = records[recordIds[recordIds.length - 1]];
    nextCursor = lastRecord.sortKey;
  }

  return { processed: processedCount, nextCursor };
}
