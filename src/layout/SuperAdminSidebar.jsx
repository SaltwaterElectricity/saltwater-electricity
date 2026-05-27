import { memo } from "react";
import { ChevronLeft } from "lucide-react";
import { SidebarLink } from "./SidebarLink";
import { ROUTES } from "../constants/routes";
import { ROLES } from "../constants/roles";
import { cn } from "../utils/cn";
import adminLogo from "../assets/landing-page-img/saltwater-electricity-logo.png";

/**
 * INTERNAL COMPONENT: SuperAdminBranding
 * Handles logo and the toggle button with horizontal layout and hover interaction.
 * Theme based on code1.html: #1a1d21 background, #001fff primary.
 */
const SuperAdminBranding = memo(({ isExpanded, toggleCollapse }) => (
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
            <p className="text-[10px] font-bold text-[#001fff] tracking-[0.5px] mt-1 uppercase">
              Saltwater Electricity
            </p>
          </div>
        </div>
        {/* Toggle Button - Expanded State */}
        <button
          onClick={toggleCollapse}
          className={cn(
            "p-1.5 rounded-lg text-[#c2c6d8] hover:text-white hover:bg-white/5 transition-all active:scale-90"
          )}
          title="Collapse"
        >
          <ChevronLeft size={18} />
        </button>
      </>
    ) : (
      /* Collapsed State: Logo replaces with Toggle on Hover */
      <div
        className="relative w-12 h-12 flex items-center justify-center group/brand cursor-pointer transition-all rounded-xl hover:bg-white/5"
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
          Expand Menu
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-slate-900" />
        </div>
      </div>
    )}
  </div>
));

/**
 * INTERNAL COMPONENT: SuperAdminNav
 * Main navigation links and sections for Super Admin.
 */
const SuperAdminNav = memo(({ isExpanded, isAdmin, userRole, unreadCount, handleLinkClick }) => (
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
      isSuperAdmin={true}
      isCollapsed={!isExpanded}
      onClick={handleLinkClick}
    />
    <SidebarLink
      to={ROUTES.SMART_AQUA_MONITOR}
      icon="monitoring"
      label={isAdmin ? "Realtime Monitor" : "Live Monitor"}
      isResident={false}
      isSuperAdmin={true}
      isCollapsed={!isExpanded}
      onClick={handleLinkClick}
    />

    <div
      className={cn("pt-4 pb-2 transition-all", !isExpanded && "opacity-0 h-0 p-0 overflow-hidden")}
    >
      <p className="px-4 text-[11px] font-black text-[#c2c6d8]/60 uppercase tracking-[2px]">
        Operations
      </p>
    </div>

    <SidebarLink
      to={isAdmin ? ROUTES.ADMIN_REQUEST_MANAGEMENT : ROUTES.DEVICE_REQUESTS}
      icon="check_box"
      label={isAdmin ? "Request Validation" : "Device Requests"}
      isResident={false}
      isSuperAdmin={true}
      isCollapsed={!isExpanded}
      onClick={handleLinkClick}
    />
    <SidebarLink
      to={ROUTES.ADMIN_DEVICE_MANAGEMENT}
      icon="devices"
      label="Device Management"
      isResident={false}
      isSuperAdmin={true}
      isCollapsed={!isExpanded}
      onClick={handleLinkClick}
    />
    <SidebarLink
      to={ROUTES.ADMIN_RESIDENT_MANAGEMENT}
      icon="manage_accounts"
      label="Resident Management"
      isResident={false}
      isSuperAdmin={true}
      isCollapsed={!isExpanded}
      onClick={handleLinkClick}
    />
    {userRole === ROLES.SUPER_ADMIN && (
      <SidebarLink
        to={ROUTES.ADMIN_USER_MANAGEMENT}
        icon="group"
        label="User Management"
        isResident={false}
        isSuperAdmin={true}
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
      isSuperAdmin={true}
      isCollapsed={!isExpanded}
      onClick={handleLinkClick}
    />
    <SidebarLink
      to={ROUTES.ADMIN_AUDIT_LOGS}
      icon="history"
      label="Audit Logs"
      isResident={false}
      isSuperAdmin={true}
      isCollapsed={!isExpanded}
      onClick={handleLinkClick}
    />

    <div
      className={cn("pt-4 pb-2 transition-all", !isExpanded && "opacity-0 h-0 p-0 overflow-hidden")}
    >
      <p className="px-4 text-[11px] font-black text-[#c2c6d8]/60 uppercase tracking-[2px]">
        Account
      </p>
    </div>

    <SidebarLink
      to="/settings"
      icon="settings"
      label="Settings"
      isResident={false}
      isSuperAdmin={true}
      isCollapsed={!isExpanded}
      onClick={handleLinkClick}
    />
  </nav>
));

/**
 * INTERNAL COMPONENT: SuperAdminProfileFooter
 * User card and logout button.
 * Theme: Charcoal Dark (#1a1d21) with Royal Blue accents.
 */
const SuperAdminProfileFooter = memo(({ isExpanded, currentUser, user, userRole, onLogout }) => (
  <div className="mt-auto pt-2 space-y-1 border-t border-white/5 bg-[#1a1d21] sticky bottom-0 pb-2">
    {isExpanded && (
      <div className="px-2 mb-3 mt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="rounded-xl p-2 flex items-center gap-3 bg-white/5 border border-white/5 shadow-lg">
          <div className="w-9 h-9 rounded-full border border-white/10 shrink-0 relative overflow-hidden bg-[#001fff] flex items-center justify-center font-bold text-white text-[10px] shadow-inner">
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
            ) : (
              currentUser?.email?.substring(0, 2).toUpperCase() || "SA"
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-white font-bold text-sm truncate leading-tight">
              {user?.firstName ? `${user.firstName} ${user.lastName}` : "Super Admin"}
            </span>
            <span className="text-[#c2c6d8] text-[10px] font-medium truncate uppercase tracking-tighter">
              {userRole?.replace(/([A-Z])/g, " $1") || "Super Administration"}
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
          "text-[#c2c6d8] hover:bg-white/5 hover:text-white",
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
          Sign Out
        </span>

        {/* Tooltip for collapsed logout */}
        {!isExpanded && (
          <div className="absolute left-14 ml-2 px-3 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 invisible group-hover/logout:opacity-100 group-hover/logout:visible transition-all duration-200 whitespace-nowrap z-[100] shadow-2xl border border-white/10 pointer-events-none">
            Sign Out
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-slate-900" />
          </div>
        )}
      </button>
    </div>
  </div>
));

/**
 * MAIN EXPORT: SuperAdminSidebar
 * Orchestrates the sub-sections of the super admin sidebar.
 */
export const SuperAdminSidebar = memo((props) => {
  const { isExpanded } = props;

  return (
    <aside
      className={cn(
        "h-screen transition-all duration-300 ease-in-out fixed left-0 top-0 z-50 shadow-xl flex flex-col",
        "bg-[#1a1d21] border-r border-white/5 text-white hidden md:flex overflow-visible shadow-2xl",
        isExpanded ? "w-64 py-2 px-2" : "w-16 py-2 px-0"
      )}
    >
      <SuperAdminBranding {...props} />
      <SuperAdminNav {...props} />
      <SuperAdminProfileFooter {...props} />
    </aside>
  );
});

SuperAdminSidebar.displayName = "SuperAdminSidebar";
SuperAdminBranding.displayName = "SuperAdminBranding";
SuperAdminNav.displayName = "SuperAdminNav";
SuperAdminProfileFooter.displayName = "SuperAdminProfileFooter";
