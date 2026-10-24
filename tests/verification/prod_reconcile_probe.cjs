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

  // Use the Resident Production Test account
  const email = process.env.PRODUCTION_TEST_RESIDENT_A_EMAIL;
  const password = process.env.PRODUCTION_TEST_RESIDENT_A_PASSWORD;

  try {
    console.log(`Authenticating resident: ${email}`);
    const userCred = await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
    const uid = userCred.user.uid;
    console.log(`Authenticated UID: ${uid}`);

    // 1. Read own user node
    try {
      const ownSnap = await get(ref(db, `users/${uid}`));
      console.log(`READ /users/${uid}: ${ownSnap.exists() ? 'ALLOW' : 'NOT_FOUND'}`);
    } catch (e) {
      console.log(`READ /users/${uid}: DENY (${e.code})`);
    }

    // 2. Read another user node (using a known UID from previous results: 7Of2AqtQPgZtQwf2t5g5BXg5F6H3)
    const otherUid = '7Of2AqtQPgZtQwf2t5g5BXg5F6H3';
    try {
      const otherSnap = await get(ref(db, `users/${otherUid}`));
      console.log(`READ /users/${otherUid}: ALLOW`);
    } catch (e) {
      console.log(`READ /users/${otherUid}: DENY (${e.code})`);
    }

    // 3. Read /roles
    try {
      const rolesSnap = await get(ref(db, 'roles'));
      console.log(`READ /roles: ALLOW`);
    } catch (e) {
      console.log(`READ /roles: DENY (${e.code})`);
    }

  } catch (error) {
    console.error('PROBE_FAILED:', error.message);
  } finally {
    await signOut(auth).catch(() => {});
  }
}

run();
