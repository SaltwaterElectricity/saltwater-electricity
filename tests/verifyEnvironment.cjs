/**
 * Environment Safety Guard
 */
function verifyEnvironment() {
  const normalize = (url) => url ? url.replace(/\/+$/, '') : '';
  
  const requiredEnv = {
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
    databaseUrl: normalize(process.env.FIREBASE_DATABASE_URL || process.env.VITE_FIREBASE_DATABASE_URL),
    apiBaseUrl: normalize(process.env.API_BASE_URL),
    envMarker: process.env.VITE_ENV,
  };

  const approvedEnv = {
    projectId: process.env.APPROVED_TEST_PROJECT_ID,
    databaseUrl: normalize(process.env.APPROVED_TEST_DATABASE_URL),
    apiBaseUrl: normalize(process.env.APPROVED_TEST_API_BASE_URL),
    envMarker: 'test',
  };

  if (!requiredEnv.projectId || !requiredEnv.databaseUrl) {
    console.error("❌ SAFETY ERROR: Missing required environment variables.");
    process.exit(1);
  }

  const isSafe =
    requiredEnv.projectId === approvedEnv.projectId &&
    requiredEnv.databaseUrl === approvedEnv.databaseUrl &&
    (requiredEnv.apiBaseUrl === approvedEnv.apiBaseUrl || !approvedEnv.apiBaseUrl) &&
    requiredEnv.envMarker === approvedEnv.envMarker;

  if (!isSafe) {
    console.error("❌ SAFETY ERROR: Environment not recognized as an approved test environment.");
    process.exit(1);
  }

  console.log("✅ Environment Safety Verified: Running in approved test environment.");
}

module.exports = { verifyEnvironment };
