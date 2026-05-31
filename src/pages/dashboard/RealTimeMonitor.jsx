import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { ROLES } from "../../constants/roles";

// Import Role-Specific Monitor Components
import AdminRealTimeMonitor from "../admin/AdminRealTimeMonitor";
import ResidentRealTimeMonitor from "../user/ResidentRealTimeMonitor";

/**
 * PAGE: RealTimeMonitor (Controller)
 * Dynamically renders the appropriate monitoring interface based on user role.
 * Standardizes the entry point for the Real-Time Monitor module.
 */
const RealTimeMonitor = () => {
  const { currentUser, userRole, isAdmin, isSuperAdmin } = useAuth();

  // 1. Security Guard: Ensure authenticated access
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 2. Role-Based Rendering Logic
  // Admins and SuperAdmins see the fleet oversight view
  if (isAdmin || isSuperAdmin) {
    return <AdminRealTimeMonitor />;
  }

  // Residents see their personal units view
  if (userRole === ROLES.RESIDENT) {
    return <ResidentRealTimeMonitor />;
  }

  // Default Fallback
  return <ResidentRealTimeMonitor />;
};

export default RealTimeMonitor;
