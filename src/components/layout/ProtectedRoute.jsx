import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { ROLES } from "../../constants/roles";
import { LoadingSpinner } from "../ui"; // Use your standardized spinner

const ProtectedRoute = ({ requiredRole, children }) => {
  const { currentUser, userRole, mustChangePassword, loading } = useAuth();
  const location = useLocation();

  // 1. LOADING STATE: Let AuthProvider handle the heavy lifting, but fallback here if needed
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 font-sans antialiased">
        <LoadingSpinner message="Verifying System Context..." size="w-12 h-12" />
      </div>
    );
  }

  // 2. AUTH CHECK: Redirect to Login if no active Firebase session
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (mustChangePassword && location.pathname !== "/force-password-change") {
    return <Navigate to="/force-password-change" replace />;
  }

  if (!mustChangePassword && location.pathname === "/force-password-change") {
    return <Navigate to="/" replace />;
  }

  // 4. ROLE-BASED AUTHORIZATION: Clearance Check
  if (requiredRole) {
    
    if (!userRole) return <Navigate to="/unauthorized" replace />;

    const isSuperAdmin = userRole === ROLES.SUPER_ADMIN;
    const isAdmin = userRole === ROLES.ADMIN;
    const isResident = userRole === ROLES.RESIDENT;
    
    let hasClearance = false;

    if (requiredRole === ROLES.ADMIN) {
      // Admin pages allow both Admin and Super Admin
      hasClearance = isAdmin || isSuperAdmin;
    } else if (requiredRole === ROLES.SUPER_ADMIN) {
      // Super Admin pages strictly allow ONLY Super Admin
      hasClearance = isSuperAdmin;
    } else if (requiredRole === ROLES.RESIDENT) {
      // User pages allow Residents, and usually Admins/SuperAdmins for troubleshooting
      hasClearance = isResident || isAdmin || isSuperAdmin;
    } else {
      // Para sa ibang roles (e.g., technician)
      hasClearance = userRole === requiredRole || isSuperAdmin;
    }

    if (!hasClearance) {
      return <Navigate to="/unauthorized" replace />;
    }
  }


  // 5. FINAL RENDER: Validated and Authorized
  return children ? children : <Outlet />;
};

export default ProtectedRoute;