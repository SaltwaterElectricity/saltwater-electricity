/**
 * Backend Security Middleware: Account Lifecycle Enforcement
 * Ensures that only 'active' accounts can access system resources
 * and enforces password change requirements.
 */
export async function enforceAccountSecurity(req, res, { auth, db }, options = {}) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { authorized: false, status: 401, code: "auth/missing-token" };
  }

  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Fetch authoritative account state
    const accountSnap = await db.ref(`accounts/${uid}`).once("value");
    const accountData = accountSnap.val();

    if (!accountData) {
      return { authorized: false, status: 404, code: "auth/account-not-found" };
    }

    // 1. Hard Status Check: Must be 'active'
    if (accountData.status !== "active") {
      return {
        authorized: false,
        status: 403,
        code: "auth/account-disabled",
        message: "Your account is suspended. Please contact your Facility Manager."
      };
    }

    // 2. Password Change Check: Except for reset endpoints
    if (accountData.requiresPasswordChange && !options.skipPasswordCheck) {
      return {
        authorized: false,
        status: 403,
        code: "auth/requires-password-change",
        message: "Security Check: You must change your password before continuing."
      };
    }

    return { authorized: true, uid, decodedToken };
  } catch (error) {
    console.error("[AccountSecurity] Auth verification failed:", error.message);
    return { authorized: false, status: 401, code: "auth/invalid-token" };
  }
}
