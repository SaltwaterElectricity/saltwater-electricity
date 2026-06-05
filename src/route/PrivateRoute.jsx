import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { ROLES } from "../constants/roles";
import { LoadingSpinner } from "../components/ui";
import NotFound from "../pages/NotFound"; // ENUMERATION PREVENTION: Use NotFound instead of Redirects

/**
 * PrivateRoute Component
 * ENFORCES: Enumeration Prevention Protocol (EPP)
 * Purpose: Instead of redirecting to login or unauthorized pages,
 * this component returns <NotFound /> to hide the existence of private routes.
 */
const PrivateRoute = ({ requiredRole, children }) => {
  const { currentUser, userRole, mustChangePassword, loading, isSessionExpired } = useAuth();
  const location = useLocation();

  // 1. LOADING STATE
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 font-sans antialiased">
        <LoadingSpinner message="Verifying System Context..." size="w-12 h-12" />
      </div>
    );
  }

  // 2. AUTH & ROLE CHECK: Silent 404 Strategy
  // If not logged in OR role check fails, return <NotFound />
  // This prevents unprivileged users or scanners from discovering valid paths.

  if (!currentUser && !isSessionExpired) {
    // Redirect to login if session has expired or user is unauthenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Mandatory internal system state check (Password reset)
  if (mustChangePassword && location.pathname !== "/force-password-change") {
    return <Navigate to="/force-password-change" replace />;
  }

  if (!mustChangePassword && location.pathname === "/force-password-change") {
    return <Navigate to="/" replace />;
  }

  // 3. ROLE-BASED AUTHORIZATION: Clearance Check
  if (requiredRole) {
    if (!userRole) return <NotFound />;

    const isSuperAdmin = userRole === ROLES.SUPER_ADMIN;
    const isAdmin = userRole === ROLES.ADMIN;
    const isResident = userRole === ROLES.RESIDENT;

    let hasClearance = false;

    if (requiredRole === ROLES.ADMIN) {
      hasClearance = isAdmin || isSuperAdmin;
    } else if (requiredRole === ROLES.SUPER_ADMIN) {
      hasClearance = isSuperAdmin;
    } else if (requiredRole === ROLES.RESIDENT) {
      hasClearance = isResident || isAdmin || isSuperAdmin;
    } else {
      hasClearance = userRole === requiredRole || isSuperAdmin;
    }

    if (!hasClearance) {
      return <NotFound />;
    }
  }

  // 4. FINAL RENDER: Validated and Authorized
  return children ? children : <Outlet />;
};

export default PrivateRoute;
