const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

async function verify() {
  try {
    const envPath = path.join(__dirname, 'sms-api-migration/.env.local');
    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const [key, ...val] = trimmed.split('=');
      if (key) env[key.trim()] = val.join('=').trim().replace(/^"|"$/g, '').replace(/^'/s, '').replace(/'$/s, '');
    });

    // Try multiple ways to fix the private key
    const keyCandidate1 = env.FIREBASE_PRIVATE_KEY.replace(/\n/g, '\n');
    const keyCandidate2 = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    
    let app;
    try {
      app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey: keyCandidate1,
        }),
        databaseURL: env.FIREBASE_DATABASE_URL,
      });
    } catch (e) {
      console.log('Candidate 1 failed, trying Candidate 2...');
      app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey: keyCandidate2,
        }),
        databaseURL: env.FIREBASE_DATABASE_URL,
      });
    }

    const db = admin.database();
    const snap = await db.ref('sms_queue_v2/test_live_final_001').once('value');
    const record = snap.val();
    console.log(JSON.stringify(record, null, 2));
  } catch (e) {
    console.error(e);
  }
}
verify();
