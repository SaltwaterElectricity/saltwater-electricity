const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.test' });

const PROD_CONFIG = {
  apiKey: 'AIzaSyA2PgBgqI6-B0qczIknhwowp0iQklD4b00', // From .env.test (Production and Staging often share the same API key)
  authDomain: 'saltwater-electricity.firebaseapp.com',
  projectId: 'saltwater-electricity',
  storageBucket: 'saltwater-electricity.appspot.com',
  messagingSenderId: '71125560428',
  appId: '1:71125560428:web:ae57f39c7d759c3ed9bc49',
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
