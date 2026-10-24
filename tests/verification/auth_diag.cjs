const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.test' });

function requiredEnv(name) {
  const value = process.env[name];
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`Missing required environment variable: ${name}`);
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

async function diagnose() {
  console.log("--- Configuration Diagnosis ---");
  console.log(`projectId: ${PROD_CONFIG.projectId}`);
  console.log(`authDomain: ${PROD_CONFIG.authDomain}`);
  console.log(`databaseURL: ${PROD_CONFIG.databaseURL}`);
  
  const email = process.env.PRODUCTION_TEST_ADMIN_EMAIL;
  const password = process.env.PRODUCTION_TEST_ADMIN_PASSWORD;
  
  console.log(`email variable present: ${!!email}`);
  console.log(`password variable present: ${!!password}`);
  
  if (!email || !password) {
    console.log("RESULT: MISSING_CREDENTIALS");
    process.exit(1);
  }

  try {
    const app = initializeApp(PROD_CONFIG);
    const auth = getAuth(app);
    
    console.log("\n--- Attempting Authentication ---");
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    console.log(`RESULT: SUCCESS`);
    console.log(`UID: ${userCred.user.uid}`);
  } catch (error) {
    console.log(`RESULT: FAILURE`);
    console.log(`ErrorCode: ${error.code}`);
    console.log(`ErrorMessage: ${error.message}`);
  }
}

diagnose();
