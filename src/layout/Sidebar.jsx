import { useState, memo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { useNotifications } from "../hooks/useNotifications";
import { useActiveDevice } from "../hooks/useActiveDevice";
import { logoutUser } from "../services/auth.service";
import { ROUTES } from "../constants/routes";
import { cn } from "../utils/cn";
import { ROLES } from "../constants/roles";
import { ConfirmationModal } from "../components/modal/ConfirmationModal";
import Toast from "../components/ui/Toast";
import { useUI } from "../context/useUI";

/**
 * Navigation Link Component
 * Handles active states and hover transitions with role-based theming.
 */
const SidebarLink = memo(({ to, icon, label, badgeCount, isResident, isCollapsed, onClick }) => (
  <NavLink
    to={to}
    end={to === ROUTES.DASHBOARD}
    onClick={onClick}
    className={({ isActive }) =>
      cn(
        "flex items-center space-x-3 px-4 py-3 transition-all relative group",
        isResident ? "rounded-xl" : "rounded-lg",
        isActive
          ? isResident
            ? "bg-white/15 text-white font-semibold shadow-black/5"
            : "bg-blue-50/50 text-blue-700 border-r-4 border-blue-600"
          : isResident
            ? "text-white/70 hover:text-white hover:bg-white/10"
            : "text-slate-500 hover:bg-slate-50/50 hover:translate-x-1",
        isCollapsed && !isResident && "justify-center px-2"
      )
    }
  >
    <span className={cn("material-symbols-outlined flex-shrink-0 transition-transform duration-300", isCollapsed && !isResident && "scale-110")}>{icon}</span>
    <span
      className={cn(
        "font-medium whitespace-nowrap overflow-hidden transition-all duration-300",
        isResident
          ? "text-[14px]"
          : "text-sm font-['Space_Grotesk']",
        !isResident && (isCollapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100 ml-3")
      )}
    >
      {label}
    </span>
    {badgeCount > 0 && (
      <span
        className={cn(
          isResident
            ? "bg-primary/50 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center ml-auto"
            : cn(
                "absolute rounded-full ring-2 ring-white transition-all duration-300",
                isCollapsed ? "right-1 top-1 w-2 h-2 bg-blue-600" : "right-3 top-3 w-2 h-2 bg-blue-600"
              )
        )}
      >
        {isResident ? badgeCount : ""}
      </span>
    )}
    
    {/* Tooltip for collapsed state (Admin Only) */}
    {isCollapsed && !isResident && (
      <div className="absolute left-14 ml-2 px-3 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[100] shadow-2xl border border-white/10 pointer-events-none">
        {label}
        {/* Tooltip Arrow */}
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-slate-900" />
      </div>
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
  const { isSidebarCollapsed, toggleSidebarCollapse } = useUI();

  // Map global collapsed state to local "isExpanded" requirement
  const isExpanded = !isSidebarCollapsed;

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

  // Close sidebar on link click (mobile only)
  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      _toggleSidebar();
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

      {/* Mobile Overlay Backdrop (Residents Only) */}
      {isResident && _isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[45] md:hidden transition-all duration-300"
          onClick={_toggleSidebar}
        />
      )}

      <aside
        className={cn(
          "h-screen transition-all duration-300 ease-in-out fixed left-0 top-0 z-50 shadow-xl flex flex-col",
          isResident
            ? cn(
                "w-64 bg-gradient-to-b from-[#0034b5] to-[#0047ff] text-white p-gutter overflow-x-hidden",
                _isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
              )
            : cn(
                "bg-white/70 backdrop-blur-md border-r border-white/40 text-slate-800 p-4 hidden md:flex overflow-visible",
                isExpanded ? "w-64" : "w-16"
              )
        )}
      >
        {/* Brand Logo & Toggle Section (Admin Only Requirement) */}
        {!isResident ? (
          <div className={cn(
            "h-16 flex items-center mb-10 relative transition-all duration-300 overflow-visible",
            isExpanded ? "justify-between px-2" : "justify-center group/top-section"
          )}>
            {/* Logo View */}
            <div className={cn(
              "flex items-center gap-2 transition-all duration-300",
              !isExpanded && "group-hover/top-section:opacity-0 group-hover/top-section:invisible"
            )}>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              </div>
              <h1 className={cn(
                "text-xl font-black tracking-tighter text-primary whitespace-nowrap overflow-hidden transition-all duration-300",
                !isExpanded ? "w-0 opacity-0" : "w-auto opacity-100"
              )}>
                Saltwater
              </h1>
            </div>

            {/* Toggle Button */}
            {isExpanded ? (
              <button
                onClick={toggleSidebarCollapse}
                className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-all active:scale-90"
                title="Collapse"
              >
                <ChevronLeft size={18} />
              </button>
            ) : (
              <button
                onClick={toggleSidebarCollapse}
                className="absolute inset-0 flex items-center justify-center opacity-0 invisible group-hover/top-section:opacity-100 group-hover/top-section:visible transition-all duration-300 text-primary active:scale-90"
                title="Expand"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>
        ) : (
          <div className="mb-10 transition-all duration-300">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary relative">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  water_drop
                </span>
                <span
                  className="material-symbols-outlined absolute text-[12px] text-[#0034b5]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  bolt
                </span>
              </div>
              <div className="transition-opacity duration-300">
                <h1 className="font-extrabold text-white text-[20px] leading-tight tracking-tighter whitespace-nowrap">
                  Saltwater
                </h1>
                <p className="text-[11px] text-white/70 font-medium whitespace-nowrap">Electricity Monitoring</p>
              </div>
            </div>
          </div>
        )}

        {/* Primary Navigation */}
        <nav className={cn(
          "flex-1 space-y-2 overflow-y-auto custom-scrollbar-hide",
          !isResident ? "overflow-y-visible" : "overflow-y-auto overflow-x-hidden"
        )}>
          {isResident ? (
            <>
              <SidebarLink
                to={ROUTES.DASHBOARD}
                icon="home"
                label="Dashboard"
                isResident={true}
                isCollapsed={false}
                onClick={handleLinkClick}
              />
              <SidebarLink
                to={ROUTES.SMART_AQUA_MONITOR}
                icon="monitor_heart"
                label="Real-Time Monitor"
                isResident={true}
                isCollapsed={false}
                onClick={handleLinkClick}
              />
              <SidebarLink
                to={ROUTES.ALERTS}
                icon="notifications"
                label="Device Alerts"
                badgeCount={unreadCount}
                isResident={true}
                isCollapsed={false}
                onClick={handleLinkClick}
              />
              <SidebarLink
                to={ROUTES.DEVICE_REQUESTS}
                icon="description"
                label="Device Request"
                isResident={true}
                isCollapsed={false}
                onClick={handleLinkClick}
              />
              {deviceId && (
                <SidebarLink
                  to={ROUTES.DEVICE_ANALYTICS.replace(":deviceId", deviceId)}
                  icon="bar_chart"
                  label="Historical Data"
                  isResident={true}
                  isCollapsed={false}
                  onClick={handleLinkClick}
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
                isCollapsed={!isExpanded}
                onClick={handleLinkClick}
              />
              <SidebarLink
                to={ROUTES.SMART_AQUA_MONITOR}
                icon="monitoring"
                label={isAdmin ? "Realtime Monitor" : "Live Monitor"}
                isResident={false}
                isCollapsed={!isExpanded}
                onClick={handleLinkClick}
              />
              <SidebarLink
                to={isAdmin ? ROUTES.ADMIN_REQUEST_MANAGEMENT : ROUTES.DEVICE_REQUESTS}
                icon="app_registration"
                label={isAdmin ? "Request Management" : "Device Requests"}
                isResident={false}
                isCollapsed={!isExpanded}
                onClick={handleLinkClick}
              />
              <SidebarLink
                to={ROUTES.ADMIN_DEVICE_MANAGEMENT}
                icon="hub"
                label="Device Management"
                isResident={false}
                isCollapsed={!isExpanded}
                onClick={handleLinkClick}
              />
              <SidebarLink
                to={ROUTES.ADMIN_RESIDENT_MANAGEMENT}
                icon="person_search"
                label="Resident Management"
                isResident={false}
                isCollapsed={!isExpanded}
                onClick={handleLinkClick}
              />
              {userRole === ROLES.SUPER_ADMIN && (
                <SidebarLink
                  to={ROUTES.ADMIN_USER_MANAGEMENT}
                  icon="group"
                  label="User Management"
                  isResident={false}
                  isCollapsed={!isExpanded}
                  onClick={handleLinkClick}
                />
              )}
              <SidebarLink
                to={ROUTES.ALERTS}
                icon="notifications_active"
                label="Alerts"
                badgeCount={unreadCount}
                isResident={false}
                isCollapsed={!isExpanded}
                onClick={handleLinkClick}
              />
              <SidebarLink
                to={ROUTES.ADMIN_AUDIT_LOGS}
                icon="insights"
                label="Audit Logs"
                isResident={false}
                isCollapsed={!isExpanded}
                onClick={handleLinkClick}
              />
              <SidebarLink
                to="/predictive"
                icon="engineering"
                label="Predictive"
                isResident={false}
                isCollapsed={!isExpanded}
                onClick={handleLinkClick}
              />
              <SidebarLink
                to="/reports"
                icon="description"
                label="Reports"
                isResident={false}
                isCollapsed={!isExpanded}
                onClick={handleLinkClick}
              />
              <SidebarLink
                to="/settings"
                icon="settings"
                label="Settings"
                isResident={false}
                isCollapsed={!isExpanded}
                onClick={handleLinkClick}
              />
            </>
          )}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto pt-6 space-y-1 overflow-x-hidden">
          {!isResident && (
            <button className={cn(
              "w-full rounded-xl font-bold mb-4 transition-all active:scale-95 h-12 flex items-center shadow-lg ocean-gradient text-white shadow-blue-200 overflow-hidden",
              !isExpanded ? "justify-center p-0" : "justify-center px-4"
            )}>
              <span className={cn("material-symbols-outlined", isExpanded && "mr-2")}>
                description
              </span>
              <span className={cn("transition-all duration-300 whitespace-nowrap", !isExpanded ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100")}>Generate Report</span>
            </button>
          )}

          <a
            className={cn(
              "flex items-center space-x-3 px-4 py-2 transition-colors rounded-lg",
              isResident
                ? "text-white/70 hover:bg-white/10 hover:text-white"
                : cn("text-slate-500 hover:text-blue-600", !isExpanded ? "justify-center px-2" : "justify-start")
            )}
            href="#"
            onClick={handleLinkClick}
          >
            <span className="material-symbols-outlined flex-shrink-0">help</span>
            <span
              className={cn(
                "font-medium whitespace-nowrap overflow-hidden transition-all duration-300",
                isResident
                  ? "text-[14px]"
                  : cn("text-sm font-['Space_Grotesk']", !isExpanded ? "w-0 opacity-0" : "w-auto opacity-100 ml-3")
              )}
            >
              Support
            </span>
          </a>

          <button
            onClick={() => {
              handleLinkClick();
              setIsLogoutModalOpen(true);
            }}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-2 transition-colors rounded-lg",
              isResident
                ? "text-white/70 hover:bg-white/10 hover:text-white"
                : cn("text-slate-500 hover:text-error", !isExpanded ? "justify-center px-2" : "justify-start")
            )}
          >
            <span className="material-symbols-outlined flex-shrink-0">logout</span>
            <span
              className={cn(
                "font-medium whitespace-nowrap overflow-hidden transition-all duration-300",
                isResident
                  ? "text-[14px]"
                  : cn("text-sm font-['Space_Grotesk']", !isExpanded ? "w-0 opacity-0" : "w-auto opacity-100 ml-3")
              )}
            >
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
