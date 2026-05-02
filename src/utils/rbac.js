import { ROLES } from "../constants/roles";

/**
 * RBAC Utility: Authoritative Token-based Role Checking
 */

/**
 * Verifies if the current user has a specific role via Custom Claims or current data object.
 * @param {Object} user - User data object containing role or claims
 * @param {string} requiredRole - The role to check (using ROLES constant)
 */
export const checkRole = (userData, requiredRole) => {
  if (!userData) return false;
  
  const { role, claims } = userData;

  if (requiredRole === ROLES.SUPER_ADMIN) return !!claims?.superAdmin || role === ROLES.SUPER_ADMIN;
  if (requiredRole === ROLES.ADMIN) return !!claims?.admin || !!claims?.superAdmin || role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;
  if (requiredRole === ROLES.RESIDENT) return true; // Residents are always authorized for basic app access

  return false;
};

// Helper Constants for static UI checks (based on claims OR hydrated role)
export const isSuperAdmin = (userData) => 
  !!userData?.claims?.superAdmin || userData?.role === ROLES.SUPER_ADMIN;

export const isAdmin = (userData) => 
  !!userData?.claims?.admin || !!userData?.claims?.superAdmin || 
  userData?.role === ROLES.ADMIN || userData?.role === ROLES.SUPER_ADMIN;

export const isResident = (userData) => 
  !isAdmin(userData) && (userData?.role === ROLES.RESIDENT || !userData?.role);

