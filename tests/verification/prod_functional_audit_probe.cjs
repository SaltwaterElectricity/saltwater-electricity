const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, signOut } = require('firebase/auth');
const { getDatabase, ref, get } = require('firebase/database');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.test' });

function requiredEnv(name) {
  const value = process.env[name];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

const PROD_CONFIG = {
  apiKey: requiredEnv('FIREBASE_API_KEY'),
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
  const residentUid = '1Fh97TwuM1PTQLz4708xuh45Xen1';

  try {
    console.log('--- RESIDENT FUNCTIONAL PROBE ---');
    await signInWithEmailAndPassword(auth, resEmail.toLowerCase().trim(), resPass);
    console.log('Auth: Resident Logged In');

    // 1. Profile Data loading
    try {
      const userSnap = await get(ref(db, `users/${residentUid}`));
      console.log(`Profile Read: ${userSnap.exists() ? 'ALLOW' : 'NOT_FOUND'}`);
    } catch (e) {
      console.log(`Profile Read: ERROR (${e.code})`);
    }

    // 2. Account Lifecycle/Status
    try {
      const accSnap = await get(ref(db, `accounts/${residentUid}`));
      console.log(`Account Read: ${accSnap.exists() ? 'ALLOW' : 'NOT_FOUND'}`);
    } catch (e) {
      console.log(`Account Read: ERROR (${e.code})`);
    }

    // 3. Session History
    try {
      const histSnap = await get(ref(db, `accounts/${residentUid}/loginHistory`));
      console.log(`Session History Read: ${histSnap.exists() ? 'ALLOW' : 'NOT_FOUND'}`);
    } catch (e) {
      console.log(`Session History Read: ERROR (${e.code})`);
    }

    // 4. Notifications
    try {
      const notifSnap = await get(ref(db, `notifications/${residentUid}`));
      console.log(`Notifications Read: ${notifSnap.exists() ? 'ALLOW' : 'NOT_FOUND'}`);
    } catch (e) {
      console.log(`Notifications Read: ERROR (${e.code})`);
    }

    // 5. Device Information (Read Only)
    try {
      const devSnap = await get(ref(db, 'device_information'));
      console.log(`Device List Read: ${devSnap.exists() ? 'ALLOW' : 'NOT_FOUND'}`);
    } catch (e) {
      console.log(`Device List Read: ERROR (${e.code})`);
    }

    // 6. Readings (The "unresolved" node)
    // Check if Resident can read their own readings if they have a device
    // We need a deviceId. From previous audit: 9451DC33F7A4 is a sample.
    // But we should check if the Resident is assigned to it.
    try {
      const assignSnap = await get(ref(db, `device_assignments/9451DC33F7A4`));
      if (assignSnap.exists() && assignSnap.val().userId === residentUid) {
        const readingSnap = await get(ref(db, `readings/9451DC33F7A4/latest`));
        console.log(`Readings/Latest Read: ${readingSnap.exists() ? 'ALLOW' : 'NOT_FOUND'}`);
      } else {
        console.log(`Readings Test: SKIPPED (No assignment to sample device)`);
      }
    } catch (e) {
      console.log(`Readings Test: ERROR (${e.code})`);
    }

  } catch (error) {
    console.error('PROBE_FAILED:', error.message);
  } finally {
    await signOut(auth).catch(() => {});
  }
}

run();
