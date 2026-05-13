export const ROUTES = Object.freeze({
  // Public
  HOME: "/",
  LOGIN: "/login",
  FORCE_PASSWORD_CHANGE: "/force-password-change",
  NOTFOUND: "/not-found",

  // Admin & User Management
  ADMIN_USER_MANAGEMENT: "/admin/user-management",
  REGISTER_USER: "/admin/register-user",
  REGISTER_STAFF: "/admin/register-staff",
  ADMIN_DEVICE_MANAGEMENT: "/admin/device-management",
  ADMIN_REQUEST_MANAGEMENT: "/admin/request-management",
  ADMIN_AUDIT_LOGS: "/admin/audit-logs",
  SMART_AQUA_MONITOR: "/monitor",

  // Resident
  DASHBOARD: "/dashboard",
  DEVICE_ANALYTICS: "/analytics/:deviceId",
  DEVICE_REQUESTS: "/device-requests",
  ALERTS: "/alerts",
});

export const ROLE_LANDING_PAGES = Object.freeze({
  superAdmin: ROUTES.ADMIN_USER_MANAGEMENT,
  admin: ROUTES.DASHBOARD,
  resident: ROUTES.DASHBOARD,
});
