import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { ROUTES, ROLE_LANDING_PAGES } from "../constants/routes";
import { ROLES } from "../constants/roles";

// Pages & Components
import NotFound from "../pages/NotFound";
import { ForcePasswordChange } from "../components";
import { MainLayout } from "../layout";
import AccountProvisioning from "../pages/admin/AccountProvisioning";
import LoginPage from "../pages/auth/LoginPage";
import UserManagement from "../pages/admin/UserManagement";
import ResidentManagement from "../pages/admin/ResidentManagement";
import DashboardController from "../pages/dashboard";
import RealTimeMonitor from "../pages/dashboard/RealTimeMonitor";
import DeviceManagement from "../pages/admin/DeviceManagement";
import RequestManagement from "../pages/admin/RequestManagement";
import AuditLogPage from "../pages/admin/AuditLogPage";
import DeviceAnalytics from "../pages/dashboard/DeviceAnalytics";
import HistoricalData from "../pages/dashboard/HistoricalData";
import DeviceRequest from "../pages/user/DeviceRequest";
import Alerts from "../pages/dashboard/Alerts";
import LandingPage from "../pages/public/LandingPage";
import PrivateRoute from "./PrivateRoute";

/**
 * RootRedirect Component
 * Standardized redirect logic for the home route.
 * 1. If not logged in: Show LandingPage.
 * 2. If logged in: Redirect to role-specific landing page (e.g., Dashboard).
 */
const RootRedirect = ({ user, role }) => {
  if (!user) return <LandingPage />;
  if (!role) return <LandingPage />; // Fallback if role is loading

  // If we have a role, redirect to the authorized landing page
  if (ROLE_LANDING_PAGES[role]) {
    return <Navigate to={ROLE_LANDING_PAGES[role]} replace />;
  }

  return <NotFound />;
};

export const AppRoutes = () => {
  const { currentUser, userRole, mustChangePassword, isAdmin, isSuperAdmin } = useAuth();

  return (
    <Routes>
      {/* 1. DEFAULT ROUTE: Render LandingPage at the root path ('/') */}
      {/* Note: Using RootRedirect to handle authenticated users as well, 
          as per standard dashboard behavior, while keeping LandingPage as the primary root component. */}
      <Route path="/" element={<RootRedirect user={currentUser} role={userRole} />} />

      {/* 2. AUTH ROUTE: Render LoginPage at '/login' */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />

      {/* Required for system security: Forced password changes */}
      <Route
        path={ROUTES.FORCE_PASSWORD_CHANGE}
        element={mustChangePassword ? <ForcePasswordChange /> : <Navigate to="/" replace />}
      />

      {/* 3. PROTECTED ROUTES & PLACEHOLDERS */}
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          {/* Dashboard Route (Standard entry point) */}
          <Route path="/dashboard" element={<DashboardController />} />

          {/* Detailed Admin Modules */}
          {(isAdmin || isSuperAdmin) && (
            <Route element={<PrivateRoute requiredRole={ROLES.ADMIN} />}>
              <Route
                path={ROUTES.ADMIN_USER_MANAGEMENT}
                element={<UserManagement currentUserRole={userRole} />}
              />
              <Route
                path={ROUTES.ADMIN_RESIDENT_MANAGEMENT}
                element={<ResidentManagement currentUserRole={userRole} />}
              />
              <Route path={ROUTES.ADMIN_DEVICE_MANAGEMENT} element={<DeviceManagement />} />
              <Route path={ROUTES.ADMIN_REQUEST_MANAGEMENT} element={<RequestManagement />} />
              <Route path={ROUTES.ADMIN_AUDIT_LOGS} element={<AuditLogPage />} />
              <Route path={ROUTES.REGISTER_USER} element={<AccountProvisioning mode="user" />} />
            </Route>
          )}

          {/* Super Admin Module */}
          {isSuperAdmin && (
            <Route element={<PrivateRoute requiredRole={ROLES.SUPER_ADMIN} />}>
              <Route path={ROUTES.REGISTER_STAFF} element={<AccountProvisioning mode="staff" />} />
            </Route>
          )}

          {/* Shared Application Views */}
          <Route path={ROUTES.ALERTS} element={<Alerts />} />
          <Route path={ROUTES.HISTORY_OVERVIEW} element={<HistoricalData />} />
          <Route path={ROUTES.DEVICE_ANALYTICS} element={<DeviceAnalytics />} />
          <Route path={ROUTES.DEVICE_HISTORY} element={<HistoricalData />} />
          <Route path={ROUTES.DEVICE_REQUESTS} element={<DeviceRequest />} />
          <Route path={ROUTES.SMART_AQUA_MONITOR} element={<RealTimeMonitor />} />
        </Route>
      </Route>

      {/* 4. SILENT 404: Catch-all renders NotFound directly if authenticated, otherwise redirects to login */}
      <Route
        path="*"
        element={currentUser ? <NotFound /> : <Navigate to={ROUTES.LOGIN} replace />}
      />
    </Routes>
  );
};

export default AppRoutes;
