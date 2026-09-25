const { verifyEnvironment } = require('./verifyEnvironment.cjs');

async function globalSetup() {
  console.log('🚀 Starting Global Setup...');

  // 1. Mandatory Environment Safety Check
  verifyEnvironment();

  // 2. Verify Dedicated Test Identities
  console.log('🔍 Verifying dedicated test identities...');
  
  const testIdentities = {
    superAdmin: process.env.TEST_USER_SUPERADMIN_EMAIL,
    admin: process.env.TEST_USER_ADMIN_EMAIL,
    residentA: process.env.TEST_USER_RESIDENT_A_EMAIL,
    residentB: process.env.TEST_USER_RESIDENT_B_EMAIL,
  };

  const missingIdentities = Object.entries(testIdentities)
    .filter(([_, email]) => !email)
    .map(([role]) => role);

  if (missingIdentities.length > 0) {
    console.error(`❌ SAFETY ERROR: Missing test identity configuration for: ${missingIdentities.join(', ')}`);
    process.exit(1);
  }

  for (const [role, email] of Object.entries(testIdentities)) {
    // Broaden test account detection to include common test patterns
    const isTestAccount = email.toLowerCase().includes('test');

    if (!isTestAccount) {
      console.error(`❌ SAFETY ERROR: Identity for ${role} (${email}) does not appear to be a dedicated test account.`);
      process.exit(1);
    }
  }

  // 3. Test Data Isolation Check
  console.log('🛡️ Verifying test-data isolation...');
  const testNamespace = process.env.TEST_DATA_NAMESPACE;
  if (!testNamespace) {
    console.error('❌ SAFETY ERROR: TEST_DATA_NAMESPACE is not defined.');
    process.exit(1);
  }
  console.log(`✅ Test data isolated within namespace: ${testNamespace}`);

  // 4. No Production Mutation Check
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PRIVATE_KEY.includes('PROD_SECRET')) {
    console.error('❌ SAFETY ERROR: Production secrets detected in test environment!');
    process.exit(1);
  }

  console.log('✅ Global Setup Completed Successfully.');
}

module.exports = globalSetup;
