import { useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { useNotifications } from "../hooks/useNotifications";
import { useActiveDevice } from "../hooks/useActiveDevice";
import { logoutUser } from "../services/auth.service";
import { ROUTES } from "../constants/routes";
import { ROLES } from "../constants/roles";
import { ConfirmationModal } from "../components/modal/ConfirmationModal";
import Toast from "../components/ui/Toast";
import { useUI } from "../context/useUI";

// Sub-components
import { AdminSidebar } from "./AdminSidebar";
import { ResidentSidebar } from "./ResidentSidebar";
import { SuperAdminSidebar } from "./SuperAdminSidebar";

/**
 * Main Sidebar Orchestrator
 * Logic common to both sidebars (logout, notification state) lives here.
 * View is delegated to AdminSidebar, SuperAdminSidebar, or ResidentSidebar based on user role.
 */
const Sidebar = memo(({ _isOpen, _toggleSidebar }) => {
  const navigate = useNavigate();
  const { isAdmin, userRole, currentUser, user } = useAuth() || {};
  const { notifications } = useNotifications(isAdmin ? "admin" : currentUser?.uid);
  const { deviceId } = useActiveDevice(currentUser?.uid, isAdmin);
  const { isSidebarCollapsed, toggleSidebarCollapse } = useUI();

  const isResident = userRole === ROLES.RESIDENT;
  const isSuperAdmin = userRole === ROLES.SUPER_ADMIN;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // LOGOUT STATE
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
      navigate(ROUTES.LOGIN, { replace: true });
    } catch {
      setToastConfig({ message: "Terminating session... Forcing secure reset.", type: "warning" });
      setShowToast(true);
      sessionStorage.clear();
      localStorage.clear();
      setTimeout(() => {
        navigate(ROUTES.LOGIN, { replace: true });
      }, 2000);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 768 && _toggleSidebar) {
      _toggleSidebar();
    }
  };

  const renderSidebar = () => {
    if (isResident) {
      return (
        <ResidentSidebar
          isOpen={_isOpen}
          toggleSidebar={_toggleSidebar}
          deviceId={deviceId}
          unreadCount={unreadCount}
          handleLinkClick={handleLinkClick}
          onLogout={() => setIsLogoutModalOpen(true)}
        />
      );
    }

    if (isSuperAdmin) {
      return (
        <SuperAdminSidebar
          isExpanded={!isSidebarCollapsed}
          toggleCollapse={toggleSidebarCollapse}
          user={user}
          userRole={userRole}
          currentUser={currentUser}
          unreadCount={unreadCount}
          handleLinkClick={handleLinkClick}
          onLogout={() => setIsLogoutModalOpen(true)}
        />
      );
    }

    return (
      <AdminSidebar
        isExpanded={!isSidebarCollapsed}
        toggleCollapse={toggleSidebarCollapse}
        isAdmin={isAdmin}
        userRole={userRole}
        currentUser={currentUser}
        user={user}
        unreadCount={unreadCount}
        handleLinkClick={handleLinkClick}
        onLogout={() => setIsLogoutModalOpen(true)}
      />
    );
  };

  return (
    <>
      <Toast
        isOpen={showToast}
        message={toastConfig.message}
        type={toastConfig.type}
        onClose={() => setShowToast(false)}
      />

      {renderSidebar()}

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        isSubmitting={isLoggingOut}
        title="Confirm Sign Out"
        description="Terminating your session will restrict access to real-time sensors until your next login."
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
