import { initFirebaseAdmin } from './firebase.js';

export function sanitizeError(error) {
  if (!error) return null;
  let msg = error.toString();
  
  // Redact Authorization headers (Bearer, Basic, etc)
  msg = msg.replace(/["']?Authorization["']?:\s*(?:["']\s*)?(Bearer|Basic)?\s*[a-zA-Z0-9._/-= ]+?["']?(\s*[,}]|$)/gi, "Authorization: ***");
  
  // Redact API Keys
  msg = msg.replace(/x-api-key:\s*[a-zA-Z0-9._/-= ]+/gi, "x-api-key: ***");
  
  // Redact Private Keys
  msg = msg.replace(/-----BEGIN\s+.*?\s+PRIVATE\s+KEY-----[\s\S]*?-----END\s+.*?\s+PRIVATE\s+KEY-----/gi, "[PRIVATE KEY REDACTED]");
  msg = msg.replace(/\[REDACTED PRIVATE KEY\]/gi, '[PRIVATE KEY REDACTED]');
  
  // Redact generic key/token patterns often found in provider errors
  msg = msg.replace(/(?:api_key|token|secret|password)\s*[:=]\s*[a-zA-Z0-9._/-= ]+/gi, ': [REDACTED]');
  
  return msg.substring(0, 255);
}

export function getOutboxPath(eventId) {
  const isE2E = process.env.E2E_MODE === 'true';
  const root = isE2E ? 'hardware_alert_outbox_e2e' : 'hardware_alert_outbox';
  return `${root}/${eventId}`;
}

function getOutboxRoot() {
  const isE2E = process.env.E2E_MODE === 'true';
  return isE2E ? 'hardware_alert_outbox_e2e' : 'hardware_alert_outbox';
}

export async function saveToOutbox(deviceId, number, message, eventId) {
  const { db } = initFirebaseAdmin();
  const outboxRef = db.ref(getOutboxPath(eventId));

  await outboxRef.set({
    deviceId,
    number,
    message,
    eventId,
    status: 'pending',
    createdAt: Date.now(),
    attempts: 0,
    lastAttemptAt: null,
  });
}

export async function markOutboxSynced(eventId) {
  const { db } = initFirebaseAdmin();
  await db.ref(getOutboxPath(eventId)).update({
    status: 'synced',
    syncedAt: Date.now(),
  });
}

export async function getPendingOutboxEntries(limit = 50) {
  const { db } = initFirebaseAdmin();
  return await db
    .ref(getOutboxRoot())
    .orderByChild('status')
    .equalTo('pending')
    .limitToFirst(limit)
    .once('value');
}

export async function updateOutboxAttempt(eventId, error = null) {
  const { db } = initFirebaseAdmin();
  const ref = db.ref(getOutboxPath(eventId));
  const snap = await ref.get();
  if (!snap.exists()) return;

  const current = snap.val();
  await ref.update({
    attempts: (current.attempts || 0) + 1,
    lastAttemptAt: Date.now(),
    lastError: sanitizeError(error),
  });
}
