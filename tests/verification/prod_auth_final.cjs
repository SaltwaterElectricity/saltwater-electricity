const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getDatabase, ref, get } = require('firebase/database');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.test' });

// CORRECTED PROD_CONFIG using API key from .env.production
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
  try {
    const app = initializeApp(PROD_CONFIG);
    const auth = getAuth(app);
    const db = getDatabase(app);

    const email = process.env.PRODUCTION_TEST_ADMIN_EMAIL;
    const password = process.env.PRODUCTION_TEST_ADMIN_PASSWORD;

    if (!email || !password) {
      console.error('MISSING_CREDENTIALS');
      process.exit(1);
    }

    console.log(`Attempting auth with: ${email}`);
    const userCred = await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
    const uid = userCred.user.uid;
    console.log(`AUTHENTICATION_SUCCESS: ${uid}`);

    // PROBE /users/<uid>
    const userRef = ref(db, `users/${uid}`);
    const userSnap = await get(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.val();
      console.log(`\nNODE_FOUND: /users/${uid}`);
      console.log(`Children: ${Object.keys(data).join(', ')}`);
      if (data.userName !== undefined) {
        console.log(`[!] userName child present: ${typeof data.userName}`);
      } else {
        console.log(`[-] userName child NOT found in /users/${uid}`);
      }
    } else {
      console.log(`\nNODE_NOT_FOUND: /users/${uid}`);
    }

  } catch (error) {
    console.error('ERROR:', error.code || 'unknown', error.message);
    process.exit(1);
  }
}

run();
