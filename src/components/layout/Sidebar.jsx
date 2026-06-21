import { useState, memo, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { logoutUser } from "../../services/auth.service";
import { ROUTES } from "../../constants/routes";
import { 
  LayoutDashboard, Droplets, Settings, LogOut, 
  UserRoundPlus, X, ShieldAlert, 
  History, ClipboardList, Cpu, Bell 
} from "lucide-react"; // Note: lucide-react in your original
import { cn } from "../../utils/cn";
import { Logo } from "../ui/Logo";
import { ConfirmationModal } from "../modal/ConfirmationModal";
import Toast from "../ui/Toast";

/**
 * 1. SIDEBAR LINK COMPONENT
 * Pinagsama ang Badge System at precise activation logic.
 */
const SidebarLink = memo(({ to, icon: Icon, label, onClick, badgeCount, badgeColor = "bg-red-500" }) => (
  <NavLink
    to={to}
    end={to === ROUTES.DASHBOARD || to === ROUTES.ADMIN_USER_MANAGEMENT}
    onClick={onClick}
    className={({ isActive }) =>
      cn(
        "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-bold tracking-wide",
        "text-slate-400 hover:bg-slate-800/50 hover:text-white",
        isActive && "bg-blue-600 text-white shadow-lg shadow-blue-900/40 translate-x-1"
      )
    }
  >
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
      <span className="tracking-widest">{label}</span>
    </div>

    {badgeCount > 0 && (
      <span className={cn(
        "flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black text-white animate-pulse",
        badgeColor
      )}>
        {badgeCount > 99 ? "99+" : badgeCount}
      </span>
    )}
  </NavLink>
));

export const Sidebar = memo(({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const { isSuperAdmin, isAdmin, user, userRole } = useAuth() || {};

  // UI STATES
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({ message: "", type: "success" });

  // MOCK DATA (Maaaring i-connect sa Firebase/Context)
  const alertCounts = { systemAlerts: 3, deviceRequests: 5 };

  const triggerToast = (message, type = "success") => {
    setToastConfig({ message, type });
    setShowToast(true);
  };

  const handleLinkClick = useCallback(() => {
    if (window.innerWidth < 1024 && typeof toggleSidebar === "function") {
      toggleSidebar();
    }
  }, [toggleSidebar]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
      sessionStorage.clear();
      setIsLogoutModalOpen(false);
      navigate("/login", { replace: true });
    } catch (_error) {
      triggerToast("Terminating session... Forcing local wipe.", "warning");
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

      {/* MOBILE OVERLAY - With Fade-in animation */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-300" 
          onClick={toggleSidebar} 
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-[70] w-72 bg-slate-900 border-r border-slate-800/50 flex flex-col transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)",
        "lg:relative lg:translate-x-0",
        isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full shadow-2xl lg:shadow-none"
      )}>
        
        {/* BRANDING HEADER - h-24 (96px) | px-6 (24px) */}
        <header className="h-24 flex items-center justify-between px-6 border-b border-slate-800/40 bg-slate-950/20 shrink-0">
          <Logo />
          <button 
            onClick={toggleSidebar} 
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all active:scale-90"
          >
            <X size={24} /> 
          </button>
        </header>

        {/* NAVIGATION - space-y-8 (32px) */}
        <nav className="flex-1 px-4 py-8 space-y-10 overflow-y-auto border-slate-800/40 bg-slate-950/20 custom-scrollbar">
          
          {/* ANALYTICS GROUP */}
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] px-4 mb-4">Analytics</p>
            <SidebarLink to={ROUTES.DASHBOARD} icon={LayoutDashboard} label="Main Dashboard" onClick={handleLinkClick} />
            <SidebarLink to={ROUTES.SALTWATER_ELECTRICITY_MONITOR} icon={Droplets} label="Real-time Monitor" onClick={handleLinkClick} />
            <SidebarLink to="/alerts" icon={Bell} label="System Alerts" onClick={handleLinkClick} badgeCount={alertCounts.systemAlerts} />
            <SidebarLink to="/history" icon={History} label="Data History" onClick={handleLinkClick} />
          </div>

          {/* OPERATIONS GROUP */}
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] px-4 mb-4">Operations</p>
            <SidebarLink 
              to={isAdmin ? ROUTES.ADMIN_REQUEST_MANAGEMENT : ROUTES.DEVICE_REQUESTS} 
              icon={ClipboardList} 
              label="Device Requests" 
              onClick={handleLinkClick} 
              badgeCount={alertCounts.deviceRequests} 
              badgeColor="bg-blue-600" 
            />
          </div>

          {/* ADMIN GROUP */}
          {isAdmin && (
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] px-4 mb-4">Administration</p>
              <SidebarLink to={ROUTES.ADMIN_USER_MANAGEMENT} icon={UserRoundPlus} label="User Management" onClick={handleLinkClick} />
              <SidebarLink to={ROUTES.ADMIN_DEVICE_MANAGEMENT} icon={Cpu} label="Device Management" onClick={handleLinkClick} />
              <SidebarLink to={ROUTES.ADMIN_AUDIT_LOGS} icon={ShieldAlert} label="System Audit" onClick={handleLinkClick} />
              <SidebarLink to="/admin/settings" icon={Settings} label="System Settings" onClick={handleLinkClick} />
              {isSuperAdmin && (
                <div className="pt-6 border-t border-slate-800/30 mt-6 space-y-2">
                  <SidebarLink to={ROUTES.REGISTER_ADMIN} icon={ShieldAlert} label="Security Roles" onClick={handleLinkClick} />
                </div>
              )}
            </div>
          )}
        </nav>

        {/* FOOTER - Profile & Sign Out */}
        <footer className="p-6 border-t border-slate-800/40 bg-slate-950/20 space-y-4">
          <div className="px-4 py-3 flex items-center gap-4 bg-slate-800/30 rounded-xl border border-slate-700/20 group hover:border-blue-500/30 transition-colors">
             <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">
               {user?.firstName?.[0] || 'U'}
             </div>
             <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{userRole || 'Resident'}</p>
             </div>
          </div>

          <button 
            onClick={() => setIsLogoutModalOpen(true)} 
            className="flex items-center gap-3 px-4 py-4 w-full rounded-2xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all group border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold">Sign Out</span>
          </button>
        </footer>
      </aside>

      {/* LOGOUT CONFIRMATION - Integrated extra safety info */}
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        isSubmitting={isLoggingOut}
        title="Confirm Sign Out"
        description="Terminating your session will restrict access to real-time Unisan sensors hanggang sa susunod mong login."
        confirmText="Confirm Sign Out"
        variant="danger" 
      >
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-4 items-center">
           <ShieldAlert className="text-red-400 w-6 h-6 flex-shrink-0" />
           <p className="text-[10px] text-red-300/80 leading-tight">
             Active Session Cleanup: Clearing Firebase Auth tokens and local storage cache.
           </p>
        </div>
      </ConfirmationModal>
    </>
  );
});