
const { initFirebaseAdmin } = require('./api/_utils/firebase.js');
const assert = require('assert');

async function testGuard(env, expectedPass) {
  process.env.VERCEL_ENV = 'preview';
  process.env.FIREBASE_PROJECT_ID = 'saltwater-electricity-staging';
  process.env.FIREBASE_CLIENT_EMAIL = 'test@saltwater-electricity-staging.iam.gserviceaccount.com';
  process.env.FIREBASE_PRIVATE_KEY = 'test-key';
  process.env.FIREBASE_DATABASE_URL = env.url;

  try {
    // We need to clear existing apps because initFirebaseAdmin uses getApps().length
    const admin = require('firebase-admin');
    admin.app().delete().catch(() => {}); 

    initFirebaseAdmin();
    console.log(`Testing URL: ${env.url} -> Result: PASS`);
    if (!expectedPass) throw new Error('Expected FAIL but passed');
  } catch (e) {
    console.log(`Testing URL: ${env.url} -> Result: FAIL (${e.message})`);
    if (expectedPass) throw new Error('Expected PASS but failed');
  }
}

async function run() {
  const approvedUrl = "https://saltwater-electricity-staging-default-rtdb.asia-southeast1.firebasedatabase.app";
  
  const cases = [
    { url: approvedUrl, expectedPass: true },
    { url: approvedUrl + '/', expectedPass: true },
    { url: 'https://wrong-project.firebaseio.com', expectedPass: false },
    { url: 'http://saltwater-electricity-staging-default-rtdb.asia-southeast1.firebasedatabase.app', expectedPass: false },
    { url: '', expectedPass: false },
    { url: null, expectedPass: false },
  ];

  for (const c of cases) {
    try {
      await testGuard(c, c.expectedPass);
    } catch (e) {
      console.error(`❌ CASE FAILED: ${c.url} - ${e.message}`);
    }
  }
}

run();
