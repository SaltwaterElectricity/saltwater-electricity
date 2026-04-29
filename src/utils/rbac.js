/**
 * RBAC Utility: Authoritative Token-based Role Checking
 */

/**
 * Verifies if the current user has a specific role via Custom Claims.
 * @param {Object} user - Firebase Auth user object
 * @param {string} requiredRole - The role to check ('superAdmin', 'admin', 'user')
 */
export const checkRole = async (user, requiredRole) => {
  if (!user) return false;
  
  const idTokenResult = await user.getIdTokenResult();
  const claims = idTokenResult.claims;

  if (requiredRole === 'superAdmin') return !!claims.superAdmin;
  if (requiredRole === 'admin') return !!claims.admin || !!claims.superAdmin;
  if (requiredRole === 'user') return true; // Residents are always authorized for basic app access

  return false;
};

// Helper Constants for static UI checks (based on claims)
export const isSuperAdmin = (claims) => !!claims?.superAdmin;
export const isAdmin = (claims) => !!claims?.admin || !!claims?.superAdmin;
export const isResident = (claims) => !claims?.admin && !claims?.superAdmin;
