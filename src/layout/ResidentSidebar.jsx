import { memo } from "react";
import { SidebarLink } from "./SidebarLink";
import { ROUTES } from "../constants/routes";
import { cn } from "../utils/cn";
import adminLogo from "../assets/landing-page-img/saltwater-electricity-logo.png";

/**
 * INTERNAL COMPONENT: ResidentBranding
 * Handles logo and branding text mirrored from AdminSidebar.
 */
const ResidentBranding = memo(() => (
  <div className="h-16 flex items-center mb-8 transition-all duration-300">
    <div className="flex items-center gap-2.5 group/logo px-4">
      {/* Logo container */}
      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden shadow-sm">
        <img alt="Logo" className="h-7 object-contain" src={adminLogo} />
      </div>
      {/* Text Branding - Centered block */}
      <div className="flex flex-col items-center text-center animate-in fade-in duration-500">
        <h1 className="text-sm font-black tracking-tight text-white leading-none uppercase">
          Device Monitoring
        </h1>
        <p className="text-[10px] font-bold text-blue-200 tracking-[0.5px] mt-1 uppercase">
          Saltwater Electricity
        </p>
      </div>
    </div>
  </div>
));

/**
 * INTERNAL COMPONENT: ResidentNav
 * Main navigation links and sections mirrored from legacy design (code1.html).
 */
const ResidentNav = memo(({ deviceId, unreadCount, handleLinkClick }) => (
  <nav className="flex-1 px-4 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar-hide flex flex-col pb-32">
    <SidebarLink
      to={ROUTES.DASHBOARD}
      icon="home"
      label="Main Dashboard"
      isResident={true}
      isCollapsed={false}
      onClick={handleLinkClick}
    />
    <SidebarLink
      to={ROUTES.SMART_AQUA_MONITOR}
      icon="monitoring"
      label="Realtime Monitor"
      isResident={true}
      isCollapsed={false}
      onClick={handleLinkClick}
    />
    <SidebarLink
      to={ROUTES.ALERTS}
      icon="notification_important"
      label="Device Alerts"
      badgeCount={unreadCount}
      isResident={true}
      isCollapsed={false}
      onClick={handleLinkClick}
    />
    {deviceId && (
      <SidebarLink
        to={ROUTES.DEVICE_ANALYTICS.replace(":deviceId", deviceId)}
        icon="history"
        label="Historical Data"
        isResident={true}
        isCollapsed={false}
        onClick={handleLinkClick}
      />
    )}

    <div className="pt-8 pb-4">
      <p className="px-4 text-[11px] font-bold text-white/50 uppercase tracking-[2px]">Operations</p>
    </div>

    <SidebarLink
      to={ROUTES.DEVICE_REQUESTS}
      icon="manage_accounts"
      label="Request Device"
      isResident={true}
      isCollapsed={false}
      onClick={handleLinkClick}
    />

    <div className="pt-10 space-y-1 border-t border-white/5 mt-4">
      <div className="pt-4 pb-2">
        <p className="px-4 text-[11px] font-bold text-white/50 uppercase tracking-[2px]">Account</p>
      </div>
      {/* Profile link removed as per user instruction */}
      <SidebarLink
        to="/settings"
        icon="settings"
        label="Settings"
        isResident={true}
        isCollapsed={false}
        onClick={handleLinkClick}
      />
    </div>
  </nav>
));

/**
 * MAIN EXPORT: ResidentSidebar
 * Mobile-responsive sidebar for household users.
 * Theme: Solid Royal Blue (#001fff) and Navigation mirrored from code1.html.
 */
export const ResidentSidebar = memo(
  ({ isOpen, toggleSidebar, deviceId, unreadCount, handleLinkClick, onLogout }) => {
    return (
      <>
        {isOpen && (
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[45] md:hidden transition-all duration-300"
            onClick={toggleSidebar}
          />
        )}

        <aside
          className={cn(
            "h-screen transition-all duration-300 ease-in-out fixed left-0 top-0 z-50 shadow-xl flex flex-col",
            "w-64 bg-[#001fff] text-white overflow-x-hidden border-r border-white/5 pt-2",
            isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <ResidentBranding />
          
          <ResidentNav
            deviceId={deviceId}
            unreadCount={unreadCount}
            handleLinkClick={handleLinkClick}
          />

          {/* Styled Logout Footer mirrored from code1.html */}
          <div className="pt-6 px-4 border-t border-white/5 space-y-2 absolute bottom-0 left-0 right-0 pb-4 bg-[#001fff]">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/20 transition-all rounded-xl text-white font-medium hover:bg-white/25 active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px] flex-shrink-0">logout</span>
              <span className="font-medium whitespace-nowrap">Sign Out</span>
            </button>
          </div>
        </aside>
      </>
    );
  }
);

ResidentSidebar.displayName = "ResidentSidebar";
ResidentBranding.displayName = "ResidentBranding";
ResidentNav.displayName = "ResidentNav";
