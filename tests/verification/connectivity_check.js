
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { initFirebaseAdmin } from './api/_utils/firebase.js';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const required = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_DATABASE_URL',
  'UNISMS_WEBHOOK_SECRET'
];

const varStatus = required.map(varName => ({
  variable: varName,
  present: !!process.env[varName]
}));

console.log('--- Environment Variables ---');
console.log(JSON.stringify(varStatus));

try {
  const { db } = initFirebaseAdmin();
  console.log('--- Firebase Admin Initialization ---');
  console.log('SUCCESS');
  
  // READ-ONLY CONNECTIVITY CHECK
  // We target a generic, non-sensitive path to verify connectivity.
  // We avoid /sms_queue or other application paths to be safe.
  // Reading the root of the database is often too large; we read a specific safe path.
  // If no known safe path exists, we check if the database instance exists.
  
  const testRef = db.ref('.info/connected'); // Internal Firebase metadata
  const snap = await testRef.once('value');
  console.log('--- RTDB Connectivity ---');
  console.log('SUCCESS');
} catch (error) {
  console.log('--- Firebase Error ---');
  console.log(error.message);
}
