const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getDatabase, ref, get } = require('firebase/database');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.test' });

const PROD_CONFIG = {
  apiKey: 'AIzaSyA2PgBgqI6-B0qczIknhwowp0iQklD4b00',
  authDomain: 'saltwater-electricity.firebaseapp.com',
  databaseURL: 'https://saltwater-electricity-default-rtdb.asia-southeast1.firebasedatabase.app/',
  projectId: 'saltwater-electricity',
  storageBucket: 'saltwater-electricity.appspot.com',
  messagingSenderId: '71125560428',
  appId: '1:71125560428:web:ae57f39c7d759c3ed9bc49',
};

async function probe() {
  try {
    const app = initializeApp(PROD_CONFIG);
    const auth = getAuth(app);
    const db = getDatabase(app);

    const email = process.env.PRODUCTION_TEST_SUPERADMIN_EMAIL;
    const password = process.env.PRODUCTION_TEST_SUPERADMIN_PASSWORD;

    if (!email || !password) {
      console.error('MISSING_CREDENTIALS');
      process.exit(1);
    }

    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;
    console.log(`AUTHENTICATED_UID: ${uid}`);

    const pathsToTest = ['users', 'accounts', 'user', 'account'];
    
    for (const path of pathsToTest) {
      try {
        const snapshot = await get(ref(db, `${path}/${uid}`));
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log(`\nMATCH_FOUND: /${path}/${uid}`);
          console.log(`Children: ${Object.keys(data).join(', ')}`);
          if (data.username !== undefined) {
            console.log(`[!] username child present: ${typeof data.username}`);
          }
        } else {
          console.log(`NO_MATCH: /${path}/${uid}`);
        }
      } catch (e) {
        console.log(`ERROR_PROBING /${path}/${uid}: ${e.message}`);
      }
    }
  } catch (error) {
    console.error('PROBE_FAILED:', error.message);
    process.exit(1);
  }
}

probe();
