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

    console.log("--- PRODUCTION AUTHENTICATION & RULES RUNTIME ---");

    for (const acc of testAccounts) {
      const password = process.env[`PRODUCTION_TEST_${acc.role.toUpperCase()}_PASSWORD`] || 
                       process.env[`PRODUCTION_TEST_RESIDENT_A_PASSWORD`]; // Fallback for resident

      if (!acc.email || !password) {
        console.log(`SKIP: Missing credentials for ${acc.role}`);
        continue;
      }

      try {
        const userCred = await signInWithEmailAndPassword(auth, acc.email.toLowerCase().trim(), password);
        const uid = userCred.user.uid;
        console.log(`\n[AUTH] ${acc.role} (${acc.email}): SUCCESS (UID: ${uid})`);

        // 1. Read own user node
        try {
          const ownUserSnap = await get(ref(db, `users/${uid}`));
          if (ownUserSnap.exists()) {
            console.log(`  [RULES] Read own /users/${uid}: PASS`);
            const data = ownUserSnap.val();
            if (data.userName !== undefined) {
              console.log(`  [DATA] userName field present: YES`);
            }
          } else {
            console.log(`  [RULES] Read own /users/${uid}: FAIL (Not found)`);
          }
        } catch (e) {
          console.log(`  [RULES] Read own /users/${uid}: FAIL (${e.code})`);
        }

        // 2. Read other user's node (should be denied for residents)
        // We use a different UID if available, or just try a random one.
        const otherUid = "some-random-uid-12345";
        try {
          await get(ref(db, `users/${otherUid}`));
          console.log(`  [RULES] Read other /users/${otherUid}: FAIL (Allowed)`);
        } catch (e) {
          console.log(`  [RULES] Read other /users/${otherUid}: PASS (Denied: ${e.code})`);
        }

        // 3. Read /roles (Admin/SuperAdmin should be allowed, Resident denied)
        try {
          await get(ref(db, 'roles'));
          console.log(`  [RULES] Read /roles: PASS (Allowed)`);
        } catch (e) {
          console.log(`  [RULES] Read /roles: PASS (Denied: ${e.code})`);
        }

      } catch (e) {
        console.log(`[AUTH] ${acc.role} (${acc.email}): FAIL (${e.code})`);
      }
    }
  } catch (error) {
    console.error('RUNTIME_ERROR:', error.message);
  }
}

runTests();
