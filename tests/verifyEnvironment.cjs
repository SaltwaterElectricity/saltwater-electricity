/**
 * Environment Safety Guard
 * 
 * This helper ensures that tests only run against explicitly approved test environments.
 * It fails closed to prevent accidental mutation of production data.
 */
function verifyEnvironment() {
  const requiredEnv = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    databaseUrl: process.env.FIREBASE_DATABASE_URL,
    apiBaseUrl: process.env.API_BASE_URL,
    envMarker: process.env.VITE_ENV,
  };

  // POSITIVE ALLOWLIST: These must match exactly.
  const approvedEnv = {
    projectId: process.env.APPROVED_TEST_PROJECT_ID,
    databaseUrl: process.env.APPROVED_TEST_DATABASE_URL,
    apiBaseUrl: process.env.APPROVED_TEST_API_BASE_URL,
    envMarker: 'test',
  };

  if (!requiredEnv.projectId || !requiredEnv.databaseUrl || !requiredEnv.apiBaseUrl) {
    console.error("❌ SAFETY ERROR: Missing required environment variables.");
    process.exit(1);
  }

  const isSafe = 
    requiredEnv.projectId === approvedEnv.projectId &&
    requiredEnv.databaseUrl === approvedEnv.databaseUrl &&
    requiredEnv.apiBaseUrl === approvedEnv.apiBaseUrl &&
    requiredEnv.envMarker === approvedEnv.envMarker;

  if (!isSafe) {
    console.error("❌ SAFETY ERROR: Environment not recognized as an approved test environment.");
    process.exit(1);
  }

  console.log("✅ Environment Safety Verified: Running in approved test environment.");
}

module.exports = { verifyEnvironment };
