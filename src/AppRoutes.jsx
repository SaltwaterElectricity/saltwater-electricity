import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
// Sa AppRoutes.jsx, dapat ganito:
import { UnauthorizedPage } from "./pages/UnauthorizedPage";

// Layout & Security Components
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { ForcePasswordChange } from "./components/passwordChange";

// Pages
import AdminRegistration from "./pages/admin/AdminRegistration";
import UserRegistration from "./pages/admin/UserRegistration"; 
import LoginPage from "./pages/auth/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";

/**
 * 1. Centralized Landing Config
 * Mas madaling basahin at i-maintain sa labas ng component.
 */
const ROLE_LANDING_PAGES = {
  superAdmin: "/admin/user-management",
  admin: "/admin/user-management",
//   technician: "/tech/controls",
  user: "/dashboard" 
};

const RootRedirect = ({ user, role }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (!role) return <Navigate to="/unauthorized" replace />;
  
  const destination = ROLE_LANDING_PAGES[role] || "/unauthorized";
  return <Navigate to={destination} replace />;
};

export const AppRoutes = () => {
  const { currentUser, userRole, mustChangePassword } = useAuth();

  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* ⚠️ Gamit tayo ng kebab-case para sa URL (Best Practice) */}
      <Route 
        path="/force-password-change" 
        element={mustChangePassword ? <ForcePasswordChange /> : <Navigate to="/" replace />} 
      />

      {/* PROTECTED ROUTES GROUP */}
      <Route element={<ProtectedRoute />}> 
        <Route element={<MainLayout />}>

          <Route path="/" element={<RootRedirect user={currentUser} role={userRole} />} />
          
          {/* 🔑 ADMIN SCOPE: Focus on User Management */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            {/* Semantic Path: Nagsasabi kung ano ang laman ng page */}
            <Route path="/admin/user-management" element={<AdminDashboard currentUserRole={userRole} />} />
            <Route path="/admin/register-user" element={<UserRegistration />} />
          </Route>

          {/* 🔑 SUPER ADMIN SCOPE */}
          <Route element={<ProtectedRoute requiredRole="superAdmin" />}>
            <Route path="/admin/register-staff" element={<AdminRegistration />} />
          </Route>

          <Route path="/dashboard" element={<div>Resident Analytics (Soon)</div>} />
        </Route>
      </Route>

      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};