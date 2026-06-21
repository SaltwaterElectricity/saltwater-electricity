import { memo } from "react";
import { ChevronLeft } from "lucide-react";
import { SidebarLink } from "./SidebarLink";
import { ROUTES } from "../constants/routes";
import { ROLES } from "../constants/roles";
import { cn } from "../utils/cn";
import adminLogo from "../assets/landing-page-img/saltwater-electricity-logo.png";

/**
 * INTERNAL COMPONENT: AdminBranding
 * Handles logo and the toggle button with horizontal layout and hover interaction.
 */
const AdminBranding = memo(({ isExpanded, toggleCollapse }) => (
  <div
    className={cn(
      "h-16 flex items-center mb-8 transition-all duration-300 relative",
      isExpanded ? "justify-between px-2" : "justify-center px-0"
    )}
  >
    {isExpanded ? (
      <>
        <div
          className="flex items-center gap-2.5 cursor-pointer group/logo"
          onClick={toggleCollapse}
        >
          {/* Logo container */}
          <div className="w-10 h-10 flex items-center justify-center shrink-0 relative overflow-hidden">
            <img alt="Logo" className="h-9 object-contain" src={adminLogo} />
          </div>
          {/* Text Branding - Centered block */}
          <div className="flex flex-col items-center text-center animate-in fade-in duration-500">
            <h1 className="text-sm font-black tracking-tight text-white leading-none uppercase">
              Device Monitoring
            </h1>
            <p className="text-[10px] font-bold text-blue-500 tracking-[0.5px] mt-1 uppercase">
              Saltwater Electricity
            </p>
          </div>
        </div>
        {/* Toggle Button - Expanded State */}
        <button
          onClick={toggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"
          title="Collapse"
        >
          <ChevronLeft size={18} />
        </button>
      </>
    ) : (
      /* Collapsed State: Logo replaces with Toggle on Hover */
      <div
        className="relative w-12 h-12 flex items-center justify-center group/brand cursor-pointer transition-all rounded-xl hover:bg-white/10"
        onClick={toggleCollapse}
      >
        {/* Logo - Hidden on hover */}
        <img
          alt="Branding"
          className="h-9 object-contain transition-all duration-300 group-hover/brand:opacity-0"
          src={adminLogo}
        />
        {/* Toggle - Revealed on hover */}
        <ChevronLeft
          size={20}
          className="absolute inset-0 m-auto opacity-0 group-hover/brand:opacity-100 transition-all duration-300 rotate-180 text-white"
        />

        {/* Tooltip for collapsed state branding */}
        <div className="absolute left-14 top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 invisible group-hover/brand:opacity-100 group-hover/brand:visible transition-all duration-200 whitespace-nowrap z-[100] shadow-2xl border border-white/10 pointer-events-none">
          Open Sidebar
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-slate-900" />
        </div>
      </div>
    )}
  </div>
));

/**
 * INTERNAL COMPONENT: AdminNav
 * Main navigation links and sections.
 */
const AdminNav = memo(({ isExpanded, isAdmin, userRole, unreadCount, handleLinkClick }) => (
  <nav
    className={cn(
      "flex-1 space-y-1 scrollbar-none pb-12 transition-all duration-300",
      isExpanded ? "px-2 overflow-y-auto" : "px-0 overflow-y-visible"
    )}
  >
    <SidebarLink
      to={ROUTES.DASHBOARD}
      icon="home"
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

    <div
      className={cn("pt-4 pb-2 transition-all", !isExpanded && "opacity-0 h-0 p-0 overflow-hidden")}
    >
      <p className="px-4 text-[11px] font-black text-slate-500 uppercase tracking-[2px]">
        Operations
      </p>
    </div>

    <SidebarLink
      to={isAdmin ? ROUTES.ADMIN_REQUEST_MANAGEMENT : ROUTES.DEVICE_REQUESTS}
      icon="check_box"
      label={isAdmin ? "Request Validation" : "Device Requests"}
      isResident={false}
      isCollapsed={!isExpanded}
      onClick={handleLinkClick}
    />
    <SidebarLink
      to={ROUTES.ADMIN_DEVICE_MANAGEMENT}
      icon="devices"
      label="Device Management"
      isResident={false}
      isCollapsed={!isExpanded}
      onClick={handleLinkClick}
    />
    <SidebarLink
      to={ROUTES.ADMIN_RESIDENT_MANAGEMENT}
      icon="manage_accounts"
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
      icon="notification_important"
      label="Alerts"
      badgeCount={unreadCount}
      isResident={false}
      isCollapsed={!isExpanded}
      onClick={handleLinkClick}
    />
    <SidebarLink
      to={ROUTES.HISTORY_OVERVIEW}
      icon="history"
      label="Historical Data"
      isResident={false}
      isCollapsed={!isExpanded}
      onClick={handleLinkClick}
    />
    <SidebarLink
      to={ROUTES.ADMIN_AUDIT_LOGS}
      icon="receipt_long"
      label="Audit Logs"
      isResident={false}
      isCollapsed={!isExpanded}
      onClick={handleLinkClick}
    />

    <div
      className={cn("pt-4 pb-2 transition-all", !isExpanded && "opacity-0 h-0 p-0 overflow-hidden")}
    >
      <p className="px-4 text-[11px] font-black text-slate-500 uppercase tracking-[2px]">Account</p>
    </div>

    <SidebarLink
      to="/settings"
      icon="settings"
      label="Settings"
      isResident={false}
      isCollapsed={!isExpanded}
      onClick={handleLinkClick}
    />
  </nav>
));

/**
 * INTERNAL COMPONENT: AdminProfileFooter
 * User card and logout button.
 */
const AdminProfileFooter = memo(({ isExpanded, currentUser, user, userRole, onLogout }) => (
  <div className="mt-auto pt-2 space-y-1 border-t border-white/5 bg-[#191b24] sticky bottom-0 pb-2">
    {isExpanded && (
      <div className="px-2 mb-3 mt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="rounded-xl p-2 flex items-center gap-3 bg-white/10 border border-white/5 shadow-lg">
          <div className="w-9 h-9 rounded-full border border-white/10 shrink-0 relative overflow-hidden bg-blue-600 flex items-center justify-center font-bold text-white text-[10px] shadow-inner">
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
            ) : (
              currentUser?.email?.substring(0, 2).toUpperCase() || "AD"
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-white font-bold text-sm truncate leading-tight">
              {user?.firstName ? `${user.firstName} ${user.lastName}` : "Administrator"}
            </span>
            <span className="text-slate-400 text-[10px] font-medium truncate uppercase tracking-tighter">
              {userRole?.replace(/([A-Z])/g, " $1") || "System Admin"}
            </span>
          </div>
        </div>
      </div>
    )}

    <div className="px-2 space-y-1 flex justify-center">
      <button
        onClick={onLogout}
        className={cn(
          "flex items-center transition-all rounded-xl py-2 relative group/logout outline-none",
          "text-slate-400 hover:bg-red-500/10 hover:text-red-400",
          !isExpanded ? "justify-center px-0 mx-auto w-10" : "w-full px-4 gap-3"
        )}
      >
        <span className="material-symbols-outlined text-[20px] flex-shrink-0 text-red-500">
          logout
        </span>
        <span
          className={cn(
            "font-medium whitespace-nowrap overflow-hidden transition-all duration-300",
            "text-sm",
            !isExpanded ? "w-0 opacity-0" : "w-auto opacity-100"
          )}
        >
          Log Out
        </span>

        {/* Tooltip for collapsed logout */}
        {!isExpanded && (
          <div className="absolute left-14 ml-2 px-3 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 invisible group-hover/logout:opacity-100 group-hover/logout:visible transition-all duration-200 whitespace-nowrap z-[100] shadow-2xl border border-white/10 pointer-events-none">
            Log Out
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-slate-900" />
          </div>
        )}
      </button>
    </div>
  </div>
));

/**
 * MAIN EXPORT: AdminSidebar
 * Orchestrates the sub-sections of the admin sidebar.
 */
export const AdminSidebar = memo((props) => {
  const { isExpanded } = props;

  return (
    <aside
      className={cn(
        "h-screen transition-all duration-300 ease-in-out fixed left-0 top-0 z-50 shadow-xl flex flex-col",
        "bg-[#191b24] border-r border-white/5 text-white hidden md:flex overflow-visible shadow-2xl",
        isExpanded ? "w-64 py-2 px-2" : "w-16 py-2 px-0"
      )}
    >
      <AdminBranding {...props} />
      <AdminNav {...props} />
      <AdminProfileFooter {...props} />
    </aside>
  );
});

AdminSidebar.displayName = "AdminSidebar";
AdminBranding.displayName = "AdminBranding";
AdminNav.displayName = "AdminNav";
AdminProfileFooter.displayName = "AdminProfileFooter";
