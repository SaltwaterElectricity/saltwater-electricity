const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
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

async function runTests() {
  try {
    const app = initializeApp(PROD_CONFIG);
    const auth = getAuth(app);
    const db = getDatabase(app);

    const testAccounts = [
      { email: process.env.PRODUCTION_TEST_SUPERADMIN_EMAIL, role: 'superAdmin' },
      { email: process.env.PRODUCTION_TEST_ADMIN_EMAIL, role: 'admin' },
      { email: process.env.PRODUCTION_TEST_RESIDENT_A_EMAIL, role: 'resident' },
    ];

    const uids = {};

    // 1. Authenticate all first to get UIDs
    for (const acc of testAccounts) {
      const password = process.env[`PRODUCTION_TEST_${acc.role.toUpperCase().replace('SUPERADMIN', 'SUPERADMIN').replace('ADMIN', 'ADMIN').replace('RESIDENT', 'RESIDENT_A')}_PASSWORD`] || 
                       process.env[`PRODUCTION_TEST_RESIDENT_A_PASSWORD`];
      
      try {
        const userCred = await signInWithEmailAndPassword(auth, acc.email.toLowerCase().trim(), password);
        uids[acc.role] = userCred.user.uid;
        console.log(`AUTH: ${acc.role} authenticated as ${uids[acc.role]}`);
      } catch (e) {
        console.log(`AUTH FAIL: ${acc.role} - ${e.message}`);
      }
    }

    const roles = Object.keys(uids);
    const residentUid = uids['resident'];
    const adminUid = uids['admin'];

    for (const role of roles) {
      const uid = uids[role];
      // Re-auth each role to ensure clean session if needed, 
      // though Client SDK typically keeps last user. 
      // For this script, we'll just use the IDs.
      
      console.log(`\n--- Testing Role: ${role} (UID: ${uid}) ---`);

      // Test Own Node
      try {
        await get(ref(db, `users/${uid}`));
        console.log(`READ /users/${uid}: SUCCESS`);
      } catch (e) {
        console.log(`READ /users/${uid}: FAIL (${e.code})`);
      }

      // Test Other User Node (Cross-read)
      const otherUid = uid === residentUid ? adminUid : residentUid;
      if (otherUid) {
        try {
          await get(ref(db, `users/${otherUid}`));
          console.log(`READ /users/${otherUid}: SUCCESS (Unauthorized Access)`);
        } catch (e) {
          console.log(`READ /users/${otherUid}: FAIL (Denied: ${e.code})`);
        }
      }

      // Test /roles
      try {
        await get(ref(db, 'roles'));
        console.log(`READ /roles: SUCCESS (Unauthorized Access)`);
      } catch (e) {
        console.log(`READ /roles: FAIL (Denied: ${e.code})`);
      }
    }
  } catch (error) {
    console.error('CRITICAL_ERROR:', error.message);
  }
}

runTests();
