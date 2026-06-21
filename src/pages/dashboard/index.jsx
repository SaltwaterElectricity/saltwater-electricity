import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

// Import mula sa iyong subfolders
import AdminDashboard from '../admin/AdminDashboard';
import ResidentDashboard from '../user/ResidentDashboard';

const DashboardController = () => {
  const { currentUser, userRole } = useAuth();

  if (!currentUser) return <Navigate to="/login" replace />;

  // Mas madaling basahin kung maraming roles
  const dashboards = {
    superadmin: <AdminDashboard />,
    admin: <AdminDashboard />,
    user: <ResidentDashboard />,
    // technician: <TechDashboard />, <-- Madaling dagdagan sa hinaharap
  };

  const currentRole = userRole?.toLowerCase(); 
  return dashboards[currentRole] || <ResidentDashboard />;
};

export default DashboardController;