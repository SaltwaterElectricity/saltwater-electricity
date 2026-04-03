import { useState, memo, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { logoutUser } from "../../services/auth.service";
import { 
  LayoutDashboard, Droplets, Settings, 
  LogOut, UserPlus, UserRoundPlus, X, ShieldAlert 
} from "lucide-react";
import { cn } from "../../utils/cn";
import { ConfirmationModal } from "../ui/ConfirmationModal";
import Toast from "../ui/Toast";

const SidebarLink = memo(({ to, icon: Icon, label, onClick }) => (
  <NavLink
    to={to}
    // Ensures sub-routes under /admin keep the parent link active if needed
    end={to === "/admin/dashboard"} 
    onClick={onClick}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
        "text-slate-400 hover:bg-slate-800 hover:text-white",
        isActive && "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
      )
    }
  >
    <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
    <span className="tracking-wide">{label}</span>
  </NavLink>
));

export const Sidebar = memo(({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const { isSuperAdmin, isAdmin, user } = useAuth() || {};

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({ message: "", type: "success" });

  const triggerToast = (message, type = "success") => {
    setToastConfig({ message, type });
    setShowToast(true);
  };

  // Memoize the click handler to prevent unnecessary re-renders of SidebarLinks
  const handleLinkClick = useCallback(() => {
    if (window.innerWidth < 1024 && typeof toggleSidebar === "function") {
      toggleSidebar();
    }
  }, [toggleSidebar]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
      // Clear session strictly
      sessionStorage.clear();
      setIsLogoutModalOpen(false);
      navigate("/login", { replace: true });
    } catch (error) {
      triggerToast("Terminating session... Forcing local client-side wipe.", "warning");
      
      sessionStorage.clear();
      localStorage.clear();

      setTimeout(() => {
        window.location.href = "/login";
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

      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-300" 
          onClick={toggleSidebar}
        />
      )}

      {/* SIDEBAR ASIDE */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-[70] w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out",
        "lg:relative lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full shadow-2xl lg:shadow-none"
      )}>
        
        {/* BRANDING */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-inner">
              <Droplets className="text-white w-5 h-5" />
            </div>
            <span className="font-black text-xl tracking-tighter text-white uppercase italic">
              Smart<span className="text-blue-500">Aqua</span>
            </span>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto custom-scrollbar">
          {/* MONITORING GROUP */}
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 mb-4 opacity-50">Monitoring</p>
            <SidebarLink to="/admin/dashboard" icon={LayoutDashboard} label="Overview" onClick={handleLinkClick} />
            <SidebarLink to="/sensors" icon={Droplets} label="Water Quality" onClick={handleLinkClick} />
          </div>

          {/* MANAGEMENT GROUP */}
          {isAdmin && (
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 mb-4 opacity-50">Management</p>
              <SidebarLink to="/admin/users/new" icon={UserRoundPlus} label="New Resident" onClick={handleLinkClick} />
              
              {isSuperAdmin && (
                <>
                  <SidebarLink to="/admin/staff/new" icon={UserPlus} label="Onboard Admin" onClick={handleLinkClick} />
                  <SidebarLink to="/admin/staff" icon={ShieldAlert} label="Security Roles" onClick={handleLinkClick} />
                </>
              )}
            </div>
          )}

          {/* INFRASTRUCTURE: SuperAdmin Only */}
          {isSuperAdmin && (
            <div className="space-y-2 pt-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 mb-4 opacity-50">Infrastructure</p>
              <SidebarLink to="/settings" icon={Settings} label="Global Config" onClick={handleLinkClick} />
            </div>
          )}
        </nav>

        {/* FOOTER: Logged in User Profile + Sign Out */}
        <div className="p-4 border-t border-slate-800/50 space-y-2">
          <div className="px-4 py-2 flex items-center gap-3 mb-2">
             <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-blue-400 uppercase">
                {user?.firstName?.[0] || 'A'}
             </div>
             <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-[9px] text-slate-500 font-medium uppercase tracking-tighter">{user?.role}</p>
             </div>
          </div>

          <button 
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all group border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-bold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* LOGOUT CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        isSubmitting={isLoggingOut}
        title="Confirm Sign Out"
        description="Terminating your session will restrict access to real-time Unisan sensors until your next login."
        confirmText="Confirm Sign Out"
        variant="danger" 
      >
        <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl flex gap-3 items-center">
           <LogOut className="text-red-600 w-6 h-6" />
           <p className="text-[11px] text-red-700 font-medium">
             Active Session Cleanup: Clearing Firebase Auth tokens and local storage cache.
           </p>
        </div>
      </ConfirmationModal>
    </>
  );
});