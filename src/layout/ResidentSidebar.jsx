import { memo } from "react";
import { SidebarLink } from "./SidebarLink";
import { ROUTES } from "../constants/routes";
import { cn } from "../utils/cn";

/**
 * INTERNAL COMPONENT: ResidentBranding
 * Standard logo section for residents.
 */
const ResidentBranding = memo(() => (
  <div className="mb-10 transition-all duration-300">
    <div className="flex items-center gap-3 overflow-hidden">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary relative">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
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
        <p className="text-[11px] text-white/70 font-medium whitespace-nowrap">
          Electricity Monitoring
        </p>
      </div>
    </div>
  </div>
));

/**
 * INTERNAL COMPONENT: ResidentNav
 * Simple list of links for residents.
 */
const ResidentNav = memo(({ deviceId, unreadCount, handleLinkClick }) => (
  <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar-hide">
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
      icon="monitoring"
      label="Real-Time Monitor"
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
        icon="history"
        label="Historical Data"
        isResident={true}
        isCollapsed={false}
        onClick={handleLinkClick}
      />
    )}
  </nav>
));

/**
 * MAIN EXPORT: ResidentSidebar
 * Mobile-responsive sidebar for household users.
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
            "w-64 bg-gradient-to-b from-[#0034b5] to-[#0047ff] text-white p-gutter overflow-x-hidden",
            isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <ResidentBranding />
          <ResidentNav
            deviceId={deviceId}
            unreadCount={unreadCount}
            handleLinkClick={handleLinkClick}
          />

          <div className="mt-auto pt-6 space-y-1 overflow-x-hidden">
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-2.5 transition-all rounded-xl text-white/70 hover:bg-white/10 hover:text-white"
            >
              <span className="material-symbols-outlined text-[20px] flex-shrink-0">logout</span>
              <span className="font-medium whitespace-nowrap text-[14px]">Log Out</span>
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
