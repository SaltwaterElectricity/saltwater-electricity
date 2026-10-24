const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
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
  storageBucket: 'saltwater-electricity.appspot.com',
  messagingSenderId: '71125560428',
  appId: '1:71125560428:web:ae57f39c7d759c3ed9bc49',
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
      if (data.username !== undefined) {
        console.log(`[!] username exists: ${typeof data.username}`);
      } else {
        console.log(`[-] username child NOT found in /users/${uid}`);
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
