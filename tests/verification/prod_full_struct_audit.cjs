const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, signOut } = require('firebase/auth');
const { getDatabase, ref, get } = require('firebase/database');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.test' });

const PROD_CONFIG = {
  apiKey: 'AIzaSyCoivKDivjYhaNbUHzxhYxV4s-0wExfd4Y',
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

  // Use ADMIN account to close evidence gaps (Resident cannot read /readings, /audit-logs etc)
  const admEmail = process.env.PRODUCTION_TEST_ADMIN_EMAIL;
  const admPass = process.env.PRODUCTION_TEST_ADMIN_PASSWORD;

  try {
    console.log(`Authenticating admin: ${admEmail ? 'PRESENT' : 'MISSING'}`);
    if (!admEmail || !admPass) throw new Error('Admin credentials missing from env');
    
    await signInWithEmailAndPassword(auth, admEmail.toLowerCase().trim(), admPass);
    const adminUid = (await getAuth(app)).currentUser.uid;
    console.log(`Authenticated Admin UID: ${adminUid}`);

    const nodesToTest = [
      'users', 'roles', 'accounts', 'device_information', 
      'device_assignments', 'device-requests', 'readings', 
      'commands', 'audit-logs', 'otp-requests', 'login-attempts', 'notifications'
    ];

    console.log('\n--- FULL NODE STRUCTURAL INVENTORY ---');
    for (const node of nodesToTest) {
      try {
        const snap = await get(ref(db, node));
        if (snap.exists()) {
          console.log(`${node}: EXISTS`);
          const data = snap.val();
          const firstKey = Object.keys(data)[0];
          if (firstKey) {
            const childSnap = await get(ref(db, `${node}/${firstKey}`));
            if (childSnap.exists()) {
              const val = childSnap.val();
              console.log(`  Sample Child [${firstKey}]: keys=[${Object.keys(val).join(', ')}]`);
              // Deep dive for readings
              if (node === 'readings') {
                const readingsChildren = Object.keys(val);
                readingsChildren.forEach(c => {
                   if (c === 'latest' || c === 'logs') console.log(`    Sub-child [${c}]: EXISTS`);
                });
              }
            }
          }
        } else {
          console.log(`${node}: EMPTY/NOT_FOUND`);
        }
      } catch (e) {
        console.log(`${node}: NOT_READABLE (${e.code || e.message})`);
      }
    }

    // Special check for /accounts/<uid>/loginHistory
    console.log('\n--- SPECIAL PATH CHECK: /accounts/<uid>/loginHistory ---');
    try {
      const historySnap = await get(ref(db, `accounts/${adminUid}/loginHistory`));
      if (historySnap.exists()) {
        const histData = historySnap.val();
        const keys = Object.keys(histData);
        const firstEntryKey = keys[0];
        if (firstEntryKey) {
           const entry = histData[firstEntryKey];
           console.log(`loginHistory: EXISTS; Sample Entry Keys=[${Object.keys(entry).join(', ')}]`);
        } else {
           console.log(`loginHistory: EXISTS but EMPTY`);
        }
      } else {
        console.log(`loginHistory: NOT_FOUND for UID ${adminUid}`);
      }
    } catch (e) {
      console.log(`loginHistory check ERROR: ${e.code || e.message}`);
    }

  } catch (error) {
    console.error('PROBE_FAILED:', error.message);
  } finally {
    await signOut(auth).catch(() => {});
  }
}

run();
