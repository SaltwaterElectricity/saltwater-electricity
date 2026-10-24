
const { initializeApp, getApp } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');

async function probe() {
  console.log('--- Starting Minimal Probe ---');

  try {
    // 1. Environment setup
    process.env.FIREBASE_DATABASE_EMULATOR_HOST = '127.0.0.1:9000';
    process.env.FIREBASE_DATABASE_URL = 'http://127.0.0.1:9000';

    console.log('Env set: HOST=127.0.0.1:9000, URL=http://127.0.0.1:9000');

    // 2. Init App
    let app;
    try {
      app = getApp();
      console.log('Using existing app');
    } catch (e) {
      console.log('Initializing new app...');
      app = initializeApp({
      projectId: 'test-probe',
      databaseURL: 'http://127.0.0.1:9000'
    });
    }

    // 3. Get Database
    console.log('Getting Database instance...');
    const db = getDatabase();

    console.log('Attempting read (GET /.json) with 5s timeout...');

    // We use a Promise.race to avoid the infinite hang
    const readPromise = db.ref('/').once('value');
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('READ_TIMEOUT')), 5000)
    );

    await Promise.race([readPromise, timeoutPromise]);
    console.log('Read success!');

    console.log('Attempting write with 5s timeout...');
    const writePromise = db.ref('probe').set({ status: 'ok' });
    await Promise.race([writePromise, timeoutPromise]);
    console.log('Write success!');

    console.log('--- Probe Complete ---');
  } catch (e) {
    console.error('Probe failed:', e.message);
    process.exit(1);
  }
}

probe().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
