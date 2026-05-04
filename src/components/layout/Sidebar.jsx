import { useState, memo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useNotifications } from "../../hooks/useNotifications";
import { logoutUser } from "../../services/auth.service";
import { ROUTES } from "../../constants/routes";
import { cn } from "../../utils/cn";
import { ROLES } from "../../constants/roles";
import { ConfirmationModal } from "../modal/ConfirmationModal";
import Toast from "../ui/Toast";

/**
 * Navigation Link Component
 * Handles active states and hover transitions based on code.html
 */
const SidebarLink = memo(({ to, icon, label, badgeCount }) => (
  <NavLink
    to={to}
    end={to === ROUTES.DASHBOARD}
    className={({ isActive }) =>
      cn(
        "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all justify-center group-hover/sidebar:justify-start relative",
        isActive 
          ? "bg-blue-50/50 text-blue-700 border-r-4 border-blue-600" 
          : "text-slate-500 hover:bg-slate-50/50 hover:translate-x-1"
      )
    }
  >
    <span className="material-symbols-outlined">{icon}</span>
    <span className="font-['Space_Grotesk'] text-sm font-medium hidden group-hover/sidebar:block whitespace-nowrap overflow-hidden">
      {label}
    </span>
    {badgeCount > 0 && (
      <span className="absolute right-3 top-3 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
    )}
  </NavLink>
));

/**
 * Sidebar Component
 * Collapsible glass-morphism navigation as per code.html
 */
const Sidebar = memo(({ _isOpen, _toggleSidebar }) => {
  const navigate = useNavigate();
  const { isAdmin, userRole, currentUser } = useAuth() || {};
  const { notifications } = useNotifications(isAdmin ? 'admin' : currentUser?.uid);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({ message: "", type: "success" });

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
      sessionStorage.clear();
      setIsLogoutModalOpen(false);
      navigate("/login", { replace: true });
    } catch (_error) {
      setToastConfig({ message: "Terminating session... Forcing local wipe.", type: "warning" });
      setShowToast(true);
      sessionStorage.clear();
      localStorage.clear();
      setTimeout(() => { window.location.href = ROUTES.LOGIN; }, 2000);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <Toast isOpen={showToast} message={toastConfig.message} type={toastConfig.type} onClose={() => setShowToast(false)} />

      <aside className="hidden md:flex flex-col h-screen w-20 hover:w-64 transition-all duration-300 border-r border-white/40 fixed left-0 top-0 bg-white/70 backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,82,204,0.08)] p-4 z-50 group/sidebar">
        {/* Brand Logo Section */}
        <div className="mb-10 px-2 flex flex-col items-center group-hover/sidebar:items-start">
          <h1 className="text-xl font-black tracking-tighter text-blue-700">
            S<span className="hidden group-hover/sidebar:inline">altwater Electricity</span>
          </h1>
          <p className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest font-bold text-slate-400 hidden group-hover/sidebar:block">
            {userRole === ROLES.SUPER_ADMIN ? "SuperAdmin" : "Administrator"}
          </p>
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar-hide">
          <SidebarLink to={ROUTES.DASHBOARD} icon="dashboard" label="Dashboard" />
          
          {isAdmin && (
            <>
              <SidebarLink to={ROUTES.ADMIN_DEVICE_MANAGEMENT} icon="hub" label="Device Management" />
              <SidebarLink to={ROUTES.ADMIN_USER_MANAGEMENT} icon="group" label="User Management" />
            </>
          )}
          
          <SidebarLink to={ROUTES.ALERTS} icon="notifications_active" label="Alerts" badgeCount={unreadCount} />
          
          {isAdmin && (
            <>
              <SidebarLink to={ROUTES.ADMIN_AUDIT_LOGS} icon="insights" label="Analytics" />
              <SidebarLink to="/predictive" icon="engineering" label="Predictive Maintenance" />
            </>
          )}
          
          <SidebarLink to="/reports" icon="description" label="Reports" />
          <SidebarLink to="/settings" icon="settings" label="Settings" />
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto pt-6 space-y-1">
          <button className="w-full ocean-gradient text-white font-['Space_Grotesk'] rounded-xl font-bold shadow-lg shadow-blue-200 mb-4 transition-transform active:scale-95 hidden group-hover/sidebar:block whitespace-nowrap overflow-hidden h-12 flex items-center justify-center group-hover/sidebar:px-4">
            <span className="material-symbols-outlined group-hover/sidebar:mr-2">description</span>
            <span className="hidden group-hover/sidebar:inline">Generate Report</span>
          </button>
          
          <a className="flex items-center space-x-3 px-4 py-2 text-slate-500 hover:text-blue-600 transition-colors justify-center group-hover/sidebar:justify-start" href="#">
            <span className="material-symbols-outlined">help</span>
            <span className="font-['Space_Grotesk'] text-sm font-medium hidden group-hover/sidebar:block whitespace-nowrap overflow-hidden">Support</span>
          </a>
          
          <button 
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center space-x-3 px-4 py-2 text-slate-500 hover:text-error transition-colors justify-center group-hover/sidebar:justify-start"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-['Space_Grotesk'] text-sm font-medium hidden group-hover/sidebar:block whitespace-nowrap overflow-hidden">Log Out</span>
          </button>
        </div>
      </aside>

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        isSubmitting={isLoggingOut}
        title="Confirm Sign Out"
        description="Terminating your session will restrict global visibility until next authentication."
        confirmText="Log Out"
        variant="danger" 
      />
    </>
  );
});

export default Sidebar;
