const { initializeApp } = require('firebase/app');
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
  apiKey: requiredEnv('PRODUCTION_FIREBASE_API_KEY'),
  databaseURL: 'https://saltwater-electricity-default-rtdb.asia-southeast1.firebasedatabase.app/',
  projectId: 'saltwater-electricity',
};

const STAGING_CONFIG = {
  apiKey: requiredEnv('STAGING_FIREBASE_API_KEY'),
  databaseURL: 'https://saltwater-electricity-staging-default-rtdb.asia-southeast1.firebasedatabase.app/',
  projectId: 'saltwater-electricity-staging',
};

async function audit(config, name) {
  console.log(`\n--- Structure Audit: ${name} ---`);
  const app = initializeApp(config, name);
  const db = getDatabase(app);
  
  const nodes = ['users', 'roles', 'accounts'];
  for (const node of nodes) {
    try {
      const snap = await get(ref(db, node));
      if (snap.exists()) {
        const data = snap.val();
        const uids = Object.keys(data);
        const sampleUid = uids[0];
        const sampleUser = data[sampleUid];
        console.log(`Node /${node}: PRESENT`);
        console.log(`  Sample keys in /${node}/${sampleUid}: ${Object.keys(sampleUser || {}).join(', ')}`);
      } else {
        console.log(`Node /${node}: ABSENT`);
      }
    } catch (e) {
      console.log(`Node /${node}: ERROR (${e.message})`);
    }
  }
}

async function run() {
  await audit(PROD_CONFIG, 'Production');
  await audit(STAGING_CONFIG, 'Staging');
}

run();
