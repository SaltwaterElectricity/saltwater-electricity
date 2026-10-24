const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load .env.test explicitly
const envPath = path.join(process.cwd(), '.env.test');
if (!fs.existsSync(envPath)) {
  console.error(`[FATAL] .env.test not found at ${envPath}`);
  process.exit(1);
}

dotenv.config({ path: envPath });

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
const databaseUrl = process.env.FIREBASE_DATABASE_URL || process.env.VITE_FIREBASE_DATABASE_URL;

console.log(`RESOLVED_PROJECT_ID: ${projectId}`);
console.log(`RESOLVED_DATABASE_URL: ${databaseUrl}`);

if (!projectId || !databaseUrl) {
  console.error('[FATAL] Missing Firebase Project ID or Database URL in .env.test');
  process.exit(1);
}

// Basic validation that it's not Production (based on the user's hint about 'saltwater-electricity-staging')
if (projectId === 'saltwater-electricity') {
  console.error('[FATAL] PRODUCTION PROJECT ID DETECTED. ABORTING.');
  process.exit(1);
}

console.log('TARGET_VERIFIED: STAGING');
