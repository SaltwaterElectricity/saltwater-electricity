import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { ROUTES, ROLE_LANDING_PAGES } from "./constants/routes"; // Import constants

// Pages & Components
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { ForcePasswordChange } from "./components/passwordChange";
import AdminRegistration from "./pages/admin/AdminRegistration";
import UserRegistration from "./pages/admin/UserRegistration"; 
import LoginPage from "./pages/auth/LoginPage";
import UserManagement from "./pages/admin/UserManagement";
import ResidentDashboard from './pages/user/ResidentDashboard';
import DashboardController from './pages/dashboard';

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
            <Route path={ROUTES.REGISTER_USER} element={<UserRegistration />} />
          </Route>

          {/* SUPER ADMIN SCOPE */}
          <Route element={<ProtectedRoute requiredRole="superAdmin" />}>
            <Route path={ROUTES.REGISTER_STAFF} element={<AdminRegistration />} />
          </Route>

          <Route path={ROUTES.DASHBOARD} element={<DashboardController />} />
        </Route>
      </Route>

      <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};