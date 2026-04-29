export const ROUTES = Object.freeze({
  // Public
  HOME: "/",
  LOGIN: "/login",
  FORCE_PASSWORD_CHANGE: "/force-password-change",
  UNAUTHORIZED: "/unauthorized",

  // Admin & User Management
  ADMIN_USER_MANAGEMENT: "/admin/user-management",
  REGISTER_USER: "/admin/register-user",
  REGISTER_STAFF: "/admin/register-staff",
  ADMIN_DEVICE_MANAGEMENT: "/admin/device-management",
  SMART_AQUA_MONITOR: "/monitor",

  // Resident
  DASHBOARD: "/dashboard",
  DEVICE_ANALYTICS: "/analytics/:deviceId",
  DEVICE_REQUESTS: "/device-requests",
});

export const ROLE_LANDING_PAGES = Object.freeze({
  superAdmin: ROUTES.ADMIN_USER_MANAGEMENT,
  admin: ROUTES.DASHBOARD,
  user: ROUTES.DASHBOARD,
});