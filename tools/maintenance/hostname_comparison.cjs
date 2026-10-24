
const { initializeApp } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const { initFirebaseAdmin } = require('./api/_utils/firebase.js');

async function runProbe(host, url, label) {
  console.log(`\n--- ${label} ---`);
  console.log(`Host: ${host}, URL: ${url}`);

  // We need a fresh app for each probe to avoid singleton interference
  // In a real app, we'd use a named app or clear the cache
  // For this diagnostic, we use a unique project ID for each probe
  const appId = `probe-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

  try {
    process.env.FIREBASE_DATABASE_EMULATOR_HOST = host;
    process.env.FIREBASE_DATABASE_URL = url;

    // We mock the utility's internal call for a clean comparison
    // but we will actually use the utility in the next step

    console.log('Initializing App...');
    const app = initializeApp({
      projectId: 'test-probe',
      databaseURL: url
    }, appId);

    console.log('Getting Database...');
    const db = getDatabase(app);

    console.log('Attempting bounded read (5s timeout)...');
    const readPromise = db.ref('/').once('value');
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('READ_TIMEOUT')), 5000)
    );

    await Promise.race([readPromise, timeoutPromise]);
    console.log('Read success!');

    console.log('Attempting bounded write (5s timeout)...');
    const writePromise = db.ref(`probe-${appId}`).set({ status: 'ok' });
    await Promise.race([writePromise, timeoutPromise]);
    console.log('Write success!');

    console.log('--- ${label} Complete ---');
    return true;
  } catch (e) {
    console.error(`Probe failed: ${e.message}`);
    return false;
  }
}

async function main() {
  const results = {};

  // Test Case 1: localhost
  results.localhost = await runProbe('localhost:9000', 'http://localhost:9000', 'LOCALHOST PROBE');

  // Test Case 2: 127.0.0.1
  results.ip = await runProbe('127.0.0.1:9000', 'http://127.0.0.1:9000', 'IP PROBE');

  console.log('\nSummary:');
  console.log(`localhost: ${results.localhost ? 'PASS' : 'FAIL'}`);
  console.log(`127.0.0.1: ${results.ip ? 'PASS' : 'FAIL'}`);

  if (!results.localhost || !results.ip) process.exit(1);
}

main().catch(console.error);
