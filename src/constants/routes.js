export const ROUTES = Object.freeze({
  // Public
  HOME: "/",
  LOGIN: "/login",
  FORCE_PASSWORD_CHANGE: "/force-password-change",
<<<<<<< HEAD
  NOTFOUND: "/not-found",
=======
  UNAUTHORIZED: "/unauthorized",
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a

  // Admin & User Management
  ADMIN_USER_MANAGEMENT: "/admin/user-management",
  REGISTER_USER: "/admin/register-user",
  REGISTER_STAFF: "/admin/register-staff",
<<<<<<< HEAD
  ADMIN_DEVICE_MANAGEMENT: "/admin/device-management",
  ADMIN_REQUEST_MANAGEMENT: "/admin/request-management",
  ADMIN_AUDIT_LOGS: "/admin/audit-logs",
  SMART_AQUA_MONITOR: "/monitor",

  // Resident
  DASHBOARD: "/dashboard",
  DEVICE_ANALYTICS: "/analytics/:deviceId",
  DEVICE_REQUESTS: "/device-requests",
  ALERTS: "/alerts",
=======
//   SMART_AQUA_MONITOR: "/monitor",

  // Resident
  DASHBOARD: "/dashboard",
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
});

export const ROLE_LANDING_PAGES = Object.freeze({
  superAdmin: ROUTES.ADMIN_USER_MANAGEMENT,
<<<<<<< HEAD
  admin: ROUTES.DASHBOARD,
  resident: ROUTES.DASHBOARD,
});
=======
  admin: ROUTES.ADMIN_USER_MANAGEMENT,
  user: ROUTES.DASHBOARD,
});
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
