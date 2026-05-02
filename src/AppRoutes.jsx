import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/useAuth";
import { ROUTES, ROLE_LANDING_PAGES } from "./constants/routes"; 
import { ROLES } from "./constants/roles";

// Pages & Components
import NotFound from "./pages/NotFound"; // Import NotFound for Silent 404
import { 
  MainLayout, 
  PrivateRoute, 
  ForcePasswordChange 
} from "./components";
import AdminRegistration from "./pages/admin/AdminRegistration";
import UserRegistration from "./pages/admin/UserRegistration"; 
import LoginPage from "./pages/auth/LoginPage";
import UserManagement from "./pages/admin/UserManagement";
import DashboardController from './pages/dashboard';
import RealTimeMonitor from "./pages/dashboard/RealTimeMonitor";
import DeviceManagement from "./pages/admin/DeviceManagement";
import RequestManagement from "./pages/admin/RequestManagement";
import AuditLogPage from "./pages/admin/AuditLogPage";
import DeviceAnalytics from "./pages/dashboard/DeviceAnalytics";
import DeviceRequest from "./pages/user/DeviceRequest";

const RootRedirect = ({ user, role }) => {
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  
  // SILENT 404: If role is invalid or unauthorized for landing, show NotFound directly
  if (!role || !ROLE_LANDING_PAGES[role]) return <NotFound />;
  
  return <Navigate to={ROLE_LANDING_PAGES[role]} replace />;
};

export const AppRoutes = () => {
  const { currentUser, userRole, mustChangePassword, isAdmin, isSuperAdmin } = useAuth();

  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      
      <Route 
        path={ROUTES.FORCE_PASSWORD_CHANGE} 
        element={mustChangePassword ? <ForcePasswordChange /> : <Navigate to="/" replace />} 
      />

      {/* PROTECTED ROUTES GROUP */}
      <Route element={<PrivateRoute />}> 
        <Route element={<MainLayout />}>

          <Route path="/" element={<RootRedirect user={currentUser} role={userRole} />} />
          
          {/* ADMIN SCOPE: Hidden from non-admins to prevent directory enumeration */}
          {(isAdmin || isSuperAdmin) && (
            <Route element={<PrivateRoute requiredRole={ROLES.ADMIN} />}>
              <Route path={ROUTES.ADMIN_USER_MANAGEMENT} element={<UserManagement currentUserRole={userRole} />} />
              <Route path={ROUTES.ADMIN_DEVICE_MANAGEMENT} element={<DeviceManagement />} />
              <Route path={ROUTES.ADMIN_REQUEST_MANAGEMENT} element={<RequestManagement />} />
              <Route path={ROUTES.ADMIN_AUDIT_LOGS} element={<AuditLogPage />} />
              <Route path={ROUTES.REGISTER_USER} element={<UserRegistration />} />
            </Route>
          )}

          {/* SUPER ADMIN SCOPE: Strictly hidden from all but Super Admins */}
          {isSuperAdmin && (
            <Route element={<PrivateRoute requiredRole={ROLES.SUPER_ADMIN} />}>
              <Route path={ROUTES.REGISTER_STAFF} element={<AdminRegistration />} />
            </Route>
          )}

          <Route path={ROUTES.DASHBOARD} element={<DashboardController />} />
          <Route path={ROUTES.DEVICE_ANALYTICS} element={<DeviceAnalytics />} />
          <Route path={ROUTES.DEVICE_REQUESTS} element={<DeviceRequest />} />
          <Route path={ROUTES.SMART_AQUA_MONITOR} element={<RealTimeMonitor />} />
        </Route>
      </Route>

      {/* SILENT 404: Catch-all renders NotFound directly to keep the URL unchanged */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};