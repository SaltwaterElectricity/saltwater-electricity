import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

import { ROLES } from "../../constants/roles";

// Import mula sa iyong subfolders
import AdminDashboard from "../admin/AdminDashboard";
import ResidentDashboard from "../user/ResidentDashboard";

const DashboardController = () => {
  const { currentUser, userRole, isSessionExpired } = useAuth();

  if (!currentUser && !isSessionExpired) return <Navigate to="/login" replace />;

  // Mas madaling basahin kung maraming roles
  const dashboards = {
    [ROLES.SUPER_ADMIN]: <AdminDashboard />,
    [ROLES.ADMIN]: <AdminDashboard />,
    [ROLES.RESIDENT]: <ResidentDashboard />,
    // technician: <TechDashboard />, <-- Madaling dagdagan sa hinaharap
  };

  return dashboards[userRole] || <ResidentDashboard />;
};

export default DashboardController;
