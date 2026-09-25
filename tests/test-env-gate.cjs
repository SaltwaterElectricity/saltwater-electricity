async function runTests() {
  console.log('--- Starting Environment Gate Safety Tests ---');

  const originalEnv = { ...process.env };

  const testCases = [
    {
      name: 'Wrong Project ID',
      env: { ...originalEnv, FIREBASE_PROJECT_ID: 'wrong-project-id' },
      shouldPass: false
    },
    {
      name: 'Wrong Database URL',
      env: { ...originalEnv, FIREBASE_DATABASE_URL: 'https://wrong-db.firebaseio.com' },
      shouldPass: false
    },
    {
      name: 'Wrong API Base URL',
      env: { ...originalEnv, API_BASE_URL: 'https://wrong-api.com' },
      shouldPass: false
    },
    {
      name: 'Missing Project ID',
      env: { ...originalEnv, FIREBASE_PROJECT_ID: '' },
      shouldPass: false
    },
    {
      name: 'Missing Database URL',
      env: { ...originalEnv, FIREBASE_DATABASE_URL: '' },
      shouldPass: false
    },
    {
      name: 'Missing API URL',
      env: { ...originalEnv, API_BASE_URL: '' },
      shouldPass: false
    },
    {
      name: 'Approved Configuration',
      env: {
        ...originalEnv,
        FIREBASE_PROJECT_ID: process.env.APPROVED_TEST_PROJECT_ID,
        FIREBASE_DATABASE_URL: process.env.APPROVED_TEST_DATABASE_URL,
        API_BASE_URL: process.env.APPROVED_TEST_API_BASE_URL,
        VITE_ENV: 'test'
      },
      shouldPass: true
    },
  ];

  for (const tc of testCases) {
    console.log(`\nTesting Case: ${tc.name}`);

    // We MUST run each check in a separate process because verifyEnvironment calls process.exit(1)
    const { execSync } = require('child_process');
    try {
      execSync(`node -e "require('./tests/verifyEnvironment.cjs').verifyEnvironment()"`, {
        env: tc.env,
        stdio: 'pipe'
      });

      if (tc.shouldPass) {
        console.log('✅ PASS: Allowed configuration accepted.');
      } else {
        console.error('❌ FAIL: Invalid configuration was accepted!');
        process.exit(1);
      }
    } catch (e) {
      if (!tc.shouldPass) {
        console.log('✅ PASS: Invalid configuration correctly rejected.');
      } else {
        console.error('❌ FAIL: Approved configuration was rejected!', e.message);
        process.exit(1);
      }
    }
  }

  console.log('\n--- All Environment Gate Tests Passed ---');
}

runTests().catch(err => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
