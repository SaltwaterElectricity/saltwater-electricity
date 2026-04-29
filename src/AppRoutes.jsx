import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/useAuth";
import { ROUTES, ROLE_LANDING_PAGES } from "./constants/routes"; // Import constants

// Pages & Components
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { 
  MainLayout, 
  ProtectedRoute, 
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
  if (!role) return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  
  const destination = ROLE_LANDING_PAGES[role] || ROUTES.UNAUTHORIZED;
  return <Navigate to={destination} replace />;
};

export const AppRoutes = () => {
  const { currentUser, userRole, mustChangePassword } = useAuth();

  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      
      <Route 
        path={ROUTES.FORCE_PASSWORD_CHANGE} 
        element={mustChangePassword ? <ForcePasswordChange /> : <Navigate to="/" replace />} 
      />

      {/* PROTECTED ROUTES GROUP */}
      <Route element={<ProtectedRoute />}> 
        <Route element={<MainLayout />}>

          <Route path="/" element={<RootRedirect user={currentUser} role={userRole} />} />
          
          {/* ADMIN SCOPE */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path={ROUTES.ADMIN_USER_MANAGEMENT} element={<UserManagement currentUserRole={userRole} />} />
            <Route path={ROUTES.ADMIN_DEVICE_MANAGEMENT} element={<DeviceManagement />} />
            <Route path={ROUTES.ADMIN_REQUEST_MANAGEMENT} element={<RequestManagement />} />
            <Route path={ROUTES.ADMIN_AUDIT_LOGS} element={<AuditLogPage />} />
            <Route path={ROUTES.REGISTER_USER} element={<UserRegistration />} />
          </Route>

          {/* SUPER ADMIN SCOPE */}
          <Route element={<ProtectedRoute requiredRole="superAdmin" />}>
            <Route path={ROUTES.REGISTER_STAFF} element={<AdminRegistration />} />
          </Route>

          <Route path={ROUTES.DASHBOARD} element={<DashboardController />} />
          <Route path={ROUTES.DEVICE_ANALYTICS} element={<DeviceAnalytics />} />
          <Route path={ROUTES.DEVICE_REQUESTS} element={<DeviceRequest />} />
          <Route path={ROUTES.SMART_AQUA_MONITOR} element={<RealTimeMonitor />} />
        </Route>
      </Route>

      <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};