async function runTests() {
  console.log('--- Starting Global Setup Safety Tests ---');

  const originalEnv = { ...process.env };

  const testCases = [
    {
      name: 'Missing Test Identities',
      env: { ...originalEnv, TEST_USER_SUPERADMIN_EMAIL: '' },
      shouldPass: false
    },
    {
      name: 'Production-like Identity',
      env: { ...originalEnv, TEST_USER_SUPERADMIN_EMAIL: 'admin@company.com' },
      shouldPass: false
    },
    {
      name: 'Missing Data Namespace',
      env: { ...originalEnv, TEST_DATA_NAMESPACE: '' },
      shouldPass: false
    },
    {
      name: 'Production Secret Detected',
      env: { ...originalEnv, FIREBASE_PRIVATE_KEY: 'some-PROD_SECRET-key' },
      shouldPass: false
    },
    {
      name: 'Valid Test Configuration',
      env: {
        ...originalEnv,
        TEST_USER_SUPERADMIN_EMAIL: 'super.test@example.com',
        TEST_USER_ADMIN_EMAIL: 'admin.test@example.com',
        TEST_USER_RESIDENT_A_EMAIL: 'resA.test@example.com',
        TEST_USER_RESIDENT_B_EMAIL: 'resB.test@example.com',
        TEST_DATA_NAMESPACE: 'test-ns-123',
        VITE_ENV: 'test',
        FIREBASE_PROJECT_ID: process.env.APPROVED_TEST_PROJECT_ID,
        FIREBASE_DATABASE_URL: process.env.APPROVED_TEST_DATABASE_URL,
        API_BASE_URL: process.env.APPROVED_TEST_API_BASE_URL,
      },
      shouldPass: true
    },
  ];

  for (const tc of testCases) {
    console.log(`\nTesting Case: ${tc.name}`);
    const { execSync } = require('child_process');
    try {
      execSync(`node -e "require('./tests/global-setup.cjs')()"`, {
        env: tc.env,
        stdio: 'pipe'
      });

      if (tc.shouldPass) {
        console.log('✅ PASS: Valid configuration accepted.');
      } else {
        console.error('❌ FAIL: Invalid configuration was accepted!');
        process.exit(1);
      }
    } catch (e) {
      if (!tc.shouldPass) {
        console.log('✅ PASS: Invalid configuration correctly rejected.');
      } else {
        console.error('❌ FAIL: Valid configuration was rejected!', e.message);
        process.exit(1);
      }
    }
  }

  console.log('\n--- All Global Setup Safety Tests Passed ---');
}

runTests().catch(err => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
