
const axios = require('axios');
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config({ path: '.env.test' });

const API_BASE = process.env.API_BASE_URL;
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const BYPASS_TOKEN = process.env.VERCEL_PROTECTION_BYPASS_TOKEN;
const FIREBASE_API_KEY = process.env.VITE_FIREBASE_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

async function getIdToken(uid) {
  const customToken = await admin.auth().createCustomToken(uid);
  const response = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`, {
    token: customToken,
    returnSecureToken: true,
  });
  return response.data.idToken;
}

async function testEndpoint(name, method, path, token = null, body = null, expectedStatus = 200) {
  console.log(`Testing ${method} ${path} (${name})...`);
  try {
    const headers = {
      'x-vercel-protection-bypass': BYPASS_TOKEN,
      'Content-Type': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (path === '/api/sms/retry_outbox') {
      headers['authorization'] = `Bearer ${CRON_SECRET}`;
    }
    
    const res = await axios({
      method,
      url: `${API_BASE}${path}`,
      headers,
      data: body,
      validateStatus: () => true,
    });
    
    if (res.status === expectedStatus) {
      console.log(`  ✅ PASS: Received ${res.status}`);
    } else {
      console.log(`  ❌ FAIL: Expected ${expectedStatus}, got ${res.status}. Response: ${JSON.stringify(res.data)}`);
    }
  } catch (e) {
    console.log(`  ❌ ERROR: ${e.message}`);
  }
}

async function run() {
  try {
    const superAdminEmail = process.env.TEST_USER_SUPERADMIN_EMAIL;
    const adminEmail = process.env.TEST_USER_ADMIN_EMAIL;
    const residentEmail = process.env.TEST_USER_RESIDENT_A_EMAIL;

    const superAdminUser = await admin.auth().getUserByEmail(superAdminEmail);
    const adminUser = await admin.auth().getUserByEmail(adminEmail);
    const residentUser = await admin.auth().getUserByEmail(residentEmail);

    const superAdminToken = await getIdToken(superAdminUser.uid);
    const adminToken = await getIdToken(adminUser.uid);
    const residentToken = await getIdToken(residentUser.uid);

    console.log('--- Public Endpoints ---');
    await testEndpoint('Health', 'GET', '/api/health');
    await testEndpoint('SMS Retry', 'GET', '/api/sms/retry_outbox');
    await testEndpoint('Verify OTP', 'GET', '/api/verifyOTP', null, { transactionToken: 'invalid', code: '000000' }, 400);

    console.log('\n--- Authenticated Endpoints ---');
    await testEndpoint('Generate OTP (Resident)', 'POST', '/api/generateOTP', residentToken, { email: residentEmail });
    await testEndpoint('Reset Password (Resident)', 'POST', '/api/resetPassword', residentToken, { email: residentEmail, newPassword: 'Password123!', transactionToken: 'invalid' }, 403);

    console.log('\n--- Admin Endpoints ---');
    await testEndpoint('Send Email (Admin)', 'POST', '/api/sendProvisioningEmail', adminToken, { to: 'test@example.com', subject: 'Test', templateType: 'otp', templateData: { otpCode: '123' } });
    await testEndpoint('Trigger Alert (Admin)', 'POST', '/api/triggerHardwareAlert', adminToken, { deviceId: '001122', tdsValue: 500, secretKey: 'c92e8b63ef72888a769708a21996e8a95817095cf26ae158fddfb75eea060d93' });
    await testEndpoint('Generate Token (Admin)', 'POST', '/api/admin/generateToken', adminToken, { durationHours: 24 });

    console.log('\n--- Authorization Boundaries ---');
    await testEndpoint('Admin Route as Resident', 'POST', '/api/admin/generateToken', residentToken, { durationHours: 24 }, 403);
    await testEndpoint('Admin Route as Admin', 'POST', '/api/admin/generateToken', adminToken, { durationHours: 24 }, 200);
    await testEndpoint('Send Email as Resident', 'POST', '/api/sendProvisioningEmail', residentToken, { to: 'test@example.com' }, 403);

  } catch (e) {
    console.error(`Test Suite Error: ${e.message}`);
  }
}

run();
