import { ROLES } from "../constants/roles";

/**
 * RBAC Utility: Authoritative Token-based Role Checking
 */

// Helper Constants for static UI checks (based on claims OR hydrated role)
export const isSuperAdmin = (userData) =>
  !!userData?.claims?.superAdmin || userData?.role === ROLES.SUPER_ADMIN;

export const isAdmin = (userData) =>
  !!userData?.claims?.admin ||
  !!userData?.claims?.superAdmin ||
  userData?.role === ROLES.ADMIN ||
  userData?.role === ROLES.SUPER_ADMIN;
