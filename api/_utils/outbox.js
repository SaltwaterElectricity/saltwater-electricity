import { initFirebaseAdmin } from "./firebase.js";

/**
 * Hardware Alert Outbox Service
 * Ensures durable delivery of alerts to the standalone SMS API.
 */
export async function saveToOutbox(deviceId, number, message, eventId) {
  const { db } = initFirebaseAdmin();
  const outboxRef = db.ref(`hardware_alert_outbox/${eventId}`);

  await outboxRef.set({
    deviceId,
    number,
    message,
    eventId,
    status: "pending",
    createdAt: Date.now(),
    attempts: 0,
    lastAttemptAt: null,
  });
}

export async function markOutboxSynced(eventId) {
  const { db } = initFirebaseAdmin();
  await db.ref(`hardware_alert_outbox/${eventId}`).update({
    status: "synced",
    syncedAt: Date.now(),
  });
}

export async function getPendingOutboxEntries(limit = 50) {
  const { db } = initFirebaseAdmin();
  return await db
    .ref("hardware_alert_outbox")
    .orderByChild("status")
    .equalTo("pending")
    .limitToFirst(limit)
    .once("value");
}

export async function updateOutboxAttempt(eventId, error = null) {
  const { db } = initFirebaseAdmin();
  const ref = db.ref(`hardware_alert_outbox/${eventId}`);
  const snap = await ref.get();
  if (!snap.exists()) return;

  const current = snap.val();
  await ref.update({
    attempts: (current.attempts || 0) + 1,
    lastAttemptAt: Date.now(),
    lastError: error ? error.toString().substring(0, 255) : null,
  });
}
