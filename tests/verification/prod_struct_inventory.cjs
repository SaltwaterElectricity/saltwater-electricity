const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, signOut } = require('firebase/auth');
const { getDatabase, ref, get } = require('firebase/database');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.test' });

function requiredEnv(name) {
  const value = process.env[name];
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`Missing required environment variable: ${name}`);
  return value.trim();
}

const PROD_CONFIG = {
  apiKey: requiredEnv('VITE_FIREBASE_API_KEY'),
  authDomain: 'saltwater-electricity.firebaseapp.com',
  databaseURL: 'https://saltwater-electricity-default-rtdb.asia-southeast1.firebasedatabase.app/',
  projectId: 'saltwater-electricity',
  storageBucket: 'saltwater-electricity.firebasestorage.app',
  messagingSenderId: '458768011751',
  appId: '1:458768011751:web:3dede021e83986b899ad42',
};

async function run() {
  const app = initializeApp(PROD_CONFIG);
  const auth = getAuth(app);
  const db = getDatabase(app);

  const resEmail = process.env.PRODUCTION_TEST_RESIDENT_B_EMAIL;
  const resPass = process.env.PRODUCTION_TEST_RESIDENT_B_PASSWORD;

  try {
    await signInWithEmailAndPassword(auth, resEmail.toLowerCase().trim(), resPass);
    const uid = (await getAuth(app)).currentUser.uid;

    const nodesToTest = [
      'users', 'roles', 'accounts', 'device_information', 
      'device_assignments', 'device-requests', 'readings', 
      'commands', 'audit-logs', 'otp-requests', 'login-attempts', 'notifications'
    ];

    console.log('--- TOP LEVEL NODE INVENTORY ---');
    for (const node of nodesToTest) {
      try {
        const snap = await get(ref(db, node));
        if (snap.exists()) {
          console.log(`${node}: EXISTS`);
          // Try to get a representative sample child
          const children = snap.val();
          const firstKey = Object.keys(children)[0];
          if (firstKey) {
            const childSnap = await get(ref(db, `${node}/${firstKey}`));
            if (childSnap.exists()) {
              const val = childSnap.val();
              const keys = Object.keys(val);
              console.log(`  Sample Child [${firstKey}]: keys=[${keys.join(', ')}]`);
            }
          }
        } else {
          console.log(`${node}: EMPTY/NOT_FOUND`);
        }
      } catch (e) {
        console.log(`${node}: NOT_READABLE (${e.code || e.message})`);
      }
    }

    console.log('\n--- UID RELATIONSHIP CHECK ---');
    const checkUids = ['users', 'roles', 'accounts'];
    for (const node of checkUids) {
      try {
        const snap = await get(ref(db, `${node}/${uid}`));
        console.log(`${node}/${uid}: ${snap.exists() ? 'EXISTS' : 'NOT_FOUND'}`);
      } catch (e) {
        console.log(`${node}/${uid}: NOT_READABLE`);
      }
    }

  } catch (error) {
    console.error('PROBE_FAILED:', error.message);
  } finally {
    await signOut(auth).catch(() => {});
  }
}

run();
