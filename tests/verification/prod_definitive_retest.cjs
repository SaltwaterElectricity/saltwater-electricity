const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, signOut } = require('firebase/auth');
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
  storageBucket: 'saltwater-electricity.firebasestorage.app',
  messagingSenderId: '458768011751',
  appId: '1:458768011751:web:3dede021e83986b899ad42',
};

async function verifyIdentity(auth, db, email, password) {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
    const uid = userCred.user.uid;

    const accountSnap = await get(ref(db, `accounts/${uid}`));
    const roleSnap = await get(ref(db, `roles/${uid}`));
    
    const accountData = accountSnap.exists() ? accountSnap.val() : {};
    const roleData = roleSnap.exists() ? roleSnap.val() : {};
    const role = roleData.role || 'unknown';

    return {
      uid,
      role,
      status: accountData.status || 'unknown',
      requiresPasswordChange: accountData.requiresPasswordChange || 'unknown',
      success: true
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function testResource(db, path) {
  try {
    await get(ref(db, path));
    return { result: 'ALLOW', error: null };
  } catch (e) {
    return { result: 'DENY', error: e.code || e.message };
  }
}

async function run() {
  const app = initializeApp(PROD_CONFIG);
  const auth = getAuth(app);
  const db = getDatabase(app);

  // 1. Resident Identity Verification (RESIDENT_B)
  const resEmail = process.env.PRODUCTION_TEST_RESIDENT_B_EMAIL;
  const resPass = process.env.PRODUCTION_TEST_RESIDENT_B_PASSWORD;
  
  console.log('--- RESIDENT_B IDENTITY CHECK ---');
  const resId = await verifyIdentity(auth, db, resEmail, resPass);
  if (!resId.success) {
    console.error(`IDENTITY_ERROR: ${resId.error}`);
    process.exit(1);
  }
  console.log(`UID: ${resId.uid}`);
  console.log(`ROLE: ${resId.role}`);
  console.log(`STATUS: ${resId.status}`);
  console.log(`REQUIRES_PW_CHANGE: ${resId.requiresPasswordChange}`);

  if (resId.role !== 'resident') {
    console.error('BLOCKED — PRODUCTION_TEST_RESIDENT_B_EMAIL does not resolve to a resident identity.');
    process.exit(1);
  }
  console.log('VERIFIED RESIDENT');

  // Resident Auth Tests
  const otherUid = '7Of2AqtQPgZtQwf2t5g5BXg5F6H3'; // Known Admin UID
  const tests = [
    { name: 'Own User', path: `users/${resId.uid}` },
    { name: 'Other User', path: `users/${otherUid}` },
    { name: 'Global Roles', path: 'roles' },
    { name: 'Own Role', path: `roles/${resId.uid}` },
  ];

  console.log('\n--- RESIDENT AUTH TESTS ---');
  for (const t of tests) {
    const res = await testResource(db, t.path);
    console.log(`${t.name} [${t.path}]: ${res.result} ${res.error ? '(' + res.error + ')' : ''}`);
  }

  await signOut(auth);

  // 2. Admin Control Test
  const admEmail = process.env.PRODUCTION_TEST_ADMIN_EMAIL;
  const admPass = process.env.PRODUCTION_TEST_ADMIN_PASSWORD;

  console.log('\n--- ADMIN CONTROL CHECK ---');
  const admId = await verifyIdentity(auth, db, admEmail, admPass);
  if (!admId.success) {
    console.error(`ADMIN_IDENTITY_ERROR: ${admId.error}`);
    process.exit(1);
  }
  console.log(`UID: ${admId.uid}`);
  console.log(`ROLE: ${admId.role}`);

  const adminTests = [
    { name: 'Other User', path: `users/${resId.uid}` },
    { name: 'Global Roles', path: 'roles' },
  ];

  for (const t of adminTests) {
    const res = await testResource(db, t.path);
    console.log(`${t.name} [${t.path}]: ${res.result} ${res.error ? '(' + res.error + ')' : ''}`);
  }

  await signOut(auth);
}

run();
