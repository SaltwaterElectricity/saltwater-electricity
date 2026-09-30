import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { ROUTES, ROLE_LANDING_PAGES } from "../constants/routes";
import { ROLES } from "../constants/roles";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";

// Pages & Components
import NotFound from "../pages/NotFound";
import { ForcePasswordChange } from "../components";
import { MainLayout } from "../layout";
import AccountProvisioning from "../pages/admin/AccountProvisioning";
import LoginPage from "../pages/auth/LoginPage";
import UserManagement from "../pages/admin/UserManagement";
import ResidentManagement from "../pages/admin/ResidentManagement";
import DashboardController from "../pages/dashboard";
import RealTimeMonitor from "../components/admin/real-time-monitor/MonitorController";
import DeviceManagement from "../pages/admin/DeviceManagement";
import RequestManagement from "../pages/admin/RequestManagement";
import AuditLogPage from "../pages/admin/AuditLogPage";
import DeviceAnalytics from "../components/admin/analytics/DeviceAnalyticsView";
import HistoricalData from "../components/admin/historical/HistoricalDataView";
import DeviceRequest from "../pages/user/DeviceRequest";
import Alerts from "../components/admin/alerts/SystemAlerts";
import LandingPage from "../pages/public/LandingPage";
import PrivateRoute from "./PrivateRoute";

const RootRedirect = ({ user, role }) => {
  const { mustChangePassword, loading } = useAuth();

  console.log(`[ROUTE-FORENSICS] RootRedirect render. User: ${user?.email || 'null'}, Role: ${role || 'null'}, mustChangePassword: ${mustChangePassword}, loading: ${loading}`);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 font-sans antialiased">
        <LoadingSpinner message="Verifying System Context..." size="w-12 h-12" />
      </div>
    );
  }

  if (!user) {
    console.log(`[ROUTE-FORENSICS] No user found -> LandingPage`);
    return <LandingPage />;
  }

  if (mustChangePassword) {
    console.log(`[ROUTE-FORENSICS] mustChangePassword is TRUE -> /force-password-change`);
    return <Navigate to={ROUTES.FORCE_PASSWORD_CHANGE} replace />;
  }

  if (!role) {
    console.log(`[ROUTE-FORENSICS] No role found -> LandingPage`);
    return <LandingPage />;
  }

  if (ROLE_LANDING_PAGES[role]) {
    const destination = ROLE_LANDING_PAGES[role];
    console.log(`[ROUTE-FORENSICS] Role ${role} found in ROLE_LANDING_PAGES -> ${destination}`);
    return <Navigate to={destination} replace />;
  }

  console.log(`[ROUTE-FORENSICS] Role ${role} not in ROLE_LANDING_PAGES -> NotFound`);
  return <NotFound />;
};

export const AppRoutes = () => {
  const { currentUser, userRole, mustChangePassword, isAdmin, isSuperAdmin } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<RootRedirect user={currentUser} role={userRole} />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route
        path={ROUTES.FORCE_PASSWORD_CHANGE}
        element={mustChangePassword ? <ForcePasswordChange /> : <Navigate to="/" replace />}
      />
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardController />} />
          {(isAdmin || isSuperAdmin) && (
            <Route element={<PrivateRoute requiredRole={ROLES.ADMIN} />}>
              <Route path={ROUTES.ADMIN_USER_MANAGEMENT} element={<UserManagement currentUserRole={userRole} />} />
              <Route path={ROUTES.ADMIN_RESIDENT_MANAGEMENT} element={<ResidentManagement currentUserRole={userRole} />} />
              <Route path={ROUTES.ADMIN_DEVICE_MANAGEMENT} element={<DeviceManagement />} />
              <Route path={ROUTES.ADMIN_REQUEST_MANAGEMENT} element={<RequestManagement />} />
              <Route path={ROUTES.ADMIN_AUDIT_LOGS} element={<AuditLogPage />} />
              <Route path={ROUTES.REGISTER_USER} element={<AccountProvisioning mode="user" />} />
            </Route>
          )}
          {isSuperAdmin && (
            <Route element={<PrivateRoute requiredRole={ROLES.SUPER_ADMIN} />}>
              <Route path={ROUTES.REGISTER_STAFF} element={<AccountProvisioning mode="staff" />} />
            </Route>
          )}
          <Route path={ROUTES.ALERTS} element={<Alerts />} />
          <Route path={ROUTES.HISTORY_OVERVIEW} element={<HistoricalData />} />
          <Route path={ROUTES.DEVICE_ANALYTICS} element={<DeviceAnalytics />} />
          <Route path={ROUTES.DEVICE_HISTORY} element={<HistoricalData />} />
          <Route path={ROUTES.DEVICE_REQUESTS} element={<DeviceRequest />} />
          <Route path={ROUTES.SMART_AQUA_MONITOR} element={<RealTimeMonitor />} />
        </Route>
      </Route>
      <Route
        path="*"
        element={currentUser ? <NotFound /> : <Navigate to={ROUTES.LOGIN} replace />}
      />
    </Routes>
  );
};

export default AppRoutes;
