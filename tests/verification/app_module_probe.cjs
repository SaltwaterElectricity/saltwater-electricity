
const { initializeApp, getApps } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const { initFirebaseAdmin } = require('./api/_utils/firebase.js');

async function probe() {
  console.log('--- Application Module Probe ---');
  const start = Date.now();

  try {
    // 1. Environment setup - mirroring test suite
    process.env.FIREBASE_DATABASE_EMULATOR_HOST = 'localhost:9000';
    process.env.FIREBASE_PROJECT_ID = 'saltwater-test-local';
    process.env.FIREBASE_DATABASE_URL = 'http://localhost:9000';

    console.log('Env set for application module');

    // 2. Initialize via actual application utility
    console.log('Calling initFirebaseAdmin()...');
    const admin = initFirebaseAdmin();
    const db = admin.db;

    console.log('Attempting bounded read...');
    const readPromise = db.ref('/').once('value');
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('READ_TIMEOUT')), 5000)
    );

    await Promise.race([readPromise, timeoutPromise]);
    console.log(`Read success! Time: ${Date.now() - start}ms`);

    console.log('Attempting bounded write...');
    const writePromise = db.ref('diag_probe').set({ status: 'ok', ts: Date.now() });
    await Promise.race([writePromise, timeoutPromise]);
    console.log(`Write success! Time: ${Date.now() - start}ms`);

    console.log('Cleaning up...');
    await db.ref('diag_probe').remove();

    console.log('--- Application Probe Complete ---');
  } catch (e) {
    console.error('Application probe failed:', e.message);
    process.exit(1);
  }
}

probe().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
