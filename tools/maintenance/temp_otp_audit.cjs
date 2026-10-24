const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const axios = require('axios');
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
  apiKey: requiredEnv('PROD_FIREBASE_API_KEY'),
  authDomain: requiredEnv('PROD_FIREBASE_AUTH_DOMAIN'),
  projectId: requiredEnv('PROD_FIREBASE_PROJECT_ID'),
  storageBucket: requiredEnv('PROD_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: requiredEnv('PROD_FIREBASE_MESSAGING_SENDER_ID'),
  appId: requiredEnv('PROD_FIREBASE_APP_ID'),
};

const PROD_API_BASE = 'https://saltwater-electricity.vercel.app';

async function runAudit() {
  try {
    console.log('--- Phase 1: Production Client Authentication ---');
    
    // Assertion: Correct Project
    if (PROD_CONFIG.projectId !== 'saltwater-electricity') {
      throw new Error('ASSERTION_FAILED: Incorrect project ID');
    }

    const app = initializeApp(PROD_CONFIG);
    const auth = getAuth(app);

    const email = process.env.PRODUCTION_OTP_TEST_EMAIL;
    const password = process.env.PRODUCTION_OTP_TEST_PASSWORD;

    if (!email || !password) {
      throw new Error('MISSING_CREDENTIALS: PRODUCTION_OTP_TEST_EMAIL or PASSWORD not found');
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    const uid = userCredential.user.uid;

    console.log('AUTHENTICATION_SUCCESS');
    console.log(`UID: ${uid}`);
    console.log(`PROJECT: ${PROD_CONFIG.projectId}`);

    const authHeader = { Authorization: `Bearer ${idToken}` };

    console.log('\n--- Phase 4: Production OTP Generation ---');
    const genResp = await axios.post(`${PROD_API_BASE}/api/generateOTP`, 
      { email }, 
      { headers: authHeader }
    );

    if (genResp.status === 200 && genResp.data.transactionToken) {
      console.log('OTP_GENERATION_SUCCESS');
      const token = genResp.data.transactionToken;
      console.log(`TOKEN_CREATED: ${token.substring(0, 8)}...`);

      // Now we need the actual OTP. Since we cannot read emails, 
      // the user must provide it or we must be told it was received.
      // For this diagnostic, we will stop here and report the token.
      console.log('\n--- RUNTIME STOP: OTP RECEIVED ---');
      console.log('The OTP has been sent to the production test account.');
      console.log('Please provide the OTP to continue the audit.');
      process.exit(0);
    } else {
      throw new Error('OTP_GENERATION_FAILED');
    }

  } catch (error) {
    console.error('AUDIT_FAILED:', error.message);
    process.exit(1);
  }
}

runAudit();
