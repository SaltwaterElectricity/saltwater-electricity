import { useState, memo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { useNotifications } from "../hooks/useNotifications";
import { useActiveDevice } from "../hooks/useActiveDevice";
import { logoutUser } from "../services/auth.service";
import { ROUTES } from "../constants/routes";
import { cn } from "../utils/cn";
import { ROLES } from "../constants/roles";
import { ConfirmationModal } from "../components/modal/ConfirmationModal";
import Toast from "../components/ui/Toast";

/**
 * Navigation Link Component
 * Handles active states and hover transitions with role-based theming.
 */
const SidebarLink = memo(({ to, icon, label, badgeCount, isResident }) => (
  <NavLink
    to={to}
    end={to === ROUTES.DASHBOARD}
    className={({ isActive }) =>
      cn(
        "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all justify-center group-hover/sidebar:justify-start relative",
        isActive
          ? isResident
            ? "bg-white/15 text-white border-l-4 border-white shadow-lg shadow-black/5 rounded-xl"
            : "bg-blue-50/50 text-blue-700 border-r-4 border-blue-600"
          : isResident
            ? "opacity-70 hover:opacity-100 hover:bg-white/10 text-white"
            : "text-slate-500 hover:bg-slate-50/50 hover:translate-x-1"
      )
    }
  >
    <span className="material-symbols-outlined">{icon}</span>
    <span className="font-['Space_Grotesk'] text-sm font-medium hidden group-hover/sidebar:block whitespace-nowrap overflow-hidden">
      {label}
    </span>
    {badgeCount > 0 && (
      <span
        className={cn(
          isResident
            ? "bg-primary text-[10px] px-2 py-0.5 rounded-full border border-white/20 ml-auto hidden group-hover/sidebar:block"
            : "absolute right-3 top-3 w-2 h-2 rounded-full ring-2 bg-blue-600 ring-white"
        )}
      >
        {isResident ? badgeCount : ""}
      </span>
    )}
  </NavLink>
));

SidebarLink.displayName = "SidebarLink";

/**
 * Sidebar Component
 * Collapsible navigation with role-based background themes.
 */
const Sidebar = memo(({ _isOpen, _toggleSidebar }) => {
  const navigate = useNavigate();
  const { isAdmin, userRole, currentUser } = useAuth() || {};
  const { notifications } = useNotifications(isAdmin ? "admin" : currentUser?.uid);
  const { deviceId } = useActiveDevice(currentUser?.uid, isAdmin);

  // THEME DETERMINATION: Residents get the vibrant gradient
  const isResident = userRole === ROLES.RESIDENT;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
    } catch {
      setToastConfig({ message: "Terminating session... Forcing local wipe.", type: "warning" });
      setShowToast(true);
      sessionStorage.clear();
      localStorage.clear();
      setTimeout(() => {
        window.location.href = ROUTES.LOGIN;
      }, 2000);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <Toast
        isOpen={showToast}
        message={toastConfig.message}
        type={toastConfig.type}
        onClose={() => setShowToast(false)}
      />

      <aside
        className={cn(
          "hidden md:flex flex-col h-screen w-20 hover:w-64 transition-all duration-300 fixed left-0 top-0 p-4 z-50 group/sidebar shadow-xl",
          isResident
            ? "sidebar-premium-gradient text-white"
            : "bg-white/70 backdrop-blur-md border-r border-white/40 text-slate-800"
        )}
      >
        {/* Brand Logo Section */}
        <div className="mb-10 px-2 flex flex-col items-center group-hover/sidebar:items-start">
          <h1
            className={cn(
              "text-xl font-black tracking-tighter",
              isResident ? "text-white" : "text-primary"
            )}
          >
            S<span className="hidden group-hover/sidebar:inline">altwater Electricity</span>
          </h1>
          <p
            className={cn(
              "font-display text-[10px] uppercase tracking-widest font-bold hidden group-hover/sidebar:block",
              isResident ? "text-white/60" : "text-outline"
            )}
          >
            {userRole === ROLES.SUPER_ADMIN ? "SuperAdmin" : isAdmin ? "Administrator" : "Resident"}
          </p>
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar-hide">
          {isResident ? (
            <>
              <SidebarLink
                to={ROUTES.DASHBOARD}
                icon="home"
                label="Dashboard"
                isResident={true}
              />
              <SidebarLink
                to={ROUTES.SMART_AQUA_MONITOR}
                icon="monitor_heart"
                label="Real-Time Monitor"
                isResident={true}
              />
              <SidebarLink
                to={ROUTES.ALERTS}
                icon="notifications"
                label="Device Alerts"
                badgeCount={unreadCount}
                isResident={true}
              />
              <SidebarLink
                to={ROUTES.DEVICE_REQUESTS}
                icon="add"
                label="Device Request"
                isResident={true}
              />
              {deviceId && (
                <SidebarLink
                  to={ROUTES.DEVICE_ANALYTICS.replace(":deviceId", deviceId)}
                  icon="history"
                  label="Historical Data"
                  isResident={true}
                />
              )}
            </>
          ) : (
            <>
              <SidebarLink
                to={ROUTES.DASHBOARD}
                icon="dashboard"
                label="Dashboard"
                isResident={false}
              />
              <SidebarLink
                to={ROUTES.SMART_AQUA_MONITOR}
                icon="monitoring"
                label={isAdmin ? "Realtime Monitor" : "Live Monitor"}
                isResident={false}
              />
              <SidebarLink
                to={isAdmin ? ROUTES.ADMIN_REQUEST_MANAGEMENT : ROUTES.DEVICE_REQUESTS}
                icon="app_registration"
                label={isAdmin ? "Request Management" : "Device Requests"}
                isResident={false}
              />
              <SidebarLink
                to={ROUTES.ADMIN_DEVICE_MANAGEMENT}
                icon="hub"
                label="Device Management"
                isResident={false}
              />
              <SidebarLink
                to={ROUTES.ADMIN_RESIDENT_MANAGEMENT}
                icon="person_search"
                label="Resident Management"
                isResident={false}
              />
              <SidebarLink
                to={ROUTES.ADMIN_USER_MANAGEMENT}
                icon="group"
                label="User Management"
                isResident={false}
              />
              <SidebarLink
                to={ROUTES.ALERTS}
                icon="notifications_active"
                label="Alerts"
                badgeCount={unreadCount}
                isResident={false}
              />
              <SidebarLink
                to={ROUTES.ADMIN_AUDIT_LOGS}
                icon="insights"
                label="Audit Logs"
                isResident={false}
              />
              <SidebarLink
                to="/predictive"
                icon="engineering"
                label="Predictive Maintenance"
                isResident={false}
              />
              <SidebarLink
                to="/reports"
                icon="description"
                label="Reports"
                isResident={false}
              />
              <SidebarLink
                to="/settings"
                icon="settings"
                label="Settings"
                isResident={false}
              />
            </>
          )}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto pt-6 space-y-1">
          <button
            className={cn(
              "w-full rounded-xl font-bold mb-4 transition-transform active:scale-95 hidden group-hover/sidebar:block whitespace-nowrap overflow-hidden h-12 flex items-center justify-center group-hover/sidebar:px-4 shadow-lg",
              isResident
                ? "bg-white/20 text-white shadow-black/10"
                : "ocean-gradient text-white shadow-blue-200"
            )}
          >
            <span className="material-symbols-outlined group-hover/sidebar:mr-2">description</span>
            <span className="hidden group-hover/sidebar:inline">Generate Report</span>
          </button>

          <a
            className={cn(
              "flex items-center space-x-3 px-4 py-2 transition-colors justify-center group-hover/sidebar:justify-start rounded-lg",
              isResident
                ? "text-white/70 hover:bg-white/10 hover:text-white"
                : "text-slate-500 hover:text-blue-600"
            )}
            href="#"
          >
            <span className="material-symbols-outlined">help</span>
            <span className="font-['Space_Grotesk'] text-sm font-medium hidden group-hover/sidebar:block whitespace-nowrap overflow-hidden">
              Support
            </span>
          </a>

          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-2 transition-colors justify-center group-hover/sidebar:justify-start rounded-lg",
              isResident
                ? "text-white/70 hover:bg-white/10 hover:text-white"
                : "text-slate-500 hover:text-error"
            )}
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-['Space_Grotesk'] text-sm font-medium hidden group-hover/sidebar:block whitespace-nowrap overflow-hidden">
              Log Out
            </span>
          </button>
        </div>
      </aside>

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        isSubmitting={isLoggingOut}
        title="Confirm Sign Out"
        description="Terminating your session will restrict access to real-time SAN ANDRES sensors hanggang sa susunod mong login."
        confirmText="Confirm Sign Out"
        variant="danger"
      >
        <div className="mt-4 p-4 bg-error/5 border border-error/20 rounded-xl flex gap-4 items-center">
          <ShieldAlert className="text-error w-6 h-6 flex-shrink-0" />
          <p className="text-[10px] text-on-surface-variant/80 font-bold uppercase tracking-tight leading-tight">
            Active Session Cleanup: Clearing Firebase Auth tokens and local storage cache.
          </p>
        </div>
      </ConfirmationModal>
    </>
  );
});

Sidebar.displayName = "Sidebar";

export default Sidebar;
