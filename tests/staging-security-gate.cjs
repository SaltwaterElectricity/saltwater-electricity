const { verifyEnvironment } = require('./verifyEnvironment.cjs');

// Explicitly set the APPROVED allowlist for this security validation session.
process.env.APPROVED_TEST_PROJECT_ID = 'saltwater-electricity';
process.env.APPROVED_TEST_DATABASE_URL = 'https://saltwater-electricity-default-rtdb.asia-southeast1.firebasedatabase.app';
process.env.APPROVED_TEST_API_BASE_URL = 'https://saltwater-electricity.vercel.app';
process.env.VITE_ENV = 'test';

// Set the actual current environment variables to be checked.
process.env.FIREBASE_PROJECT_ID = 'saltwater-electricity';
process.env.FIREBASE_DATABASE_URL = 'https://saltwater-electricity-default-rtdb.asia-southeast1.firebasedatabase.app';
process.env.API_BASE_URL = 'https://saltwater-electricity.vercel.app';

console.log('--- Phase 7A: Staging Environment Safety Gate ---');
try {
  verifyEnvironment();
  console.log('✅ SAFETY GATE PASSED: Environment positively identified and approved.');
} catch (e) {
  console.error('❌ SAFETY GATE FAILED:', e);
  process.exit(1);
}
