import { NavLink } from "react-router-dom";
import { cn } from "../utils/cn";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../context/useAuth";
import { ROLES } from "../constants/roles";
import { memo } from "react";

/**
 * BottomNavLink Component
 * Standardized navigation item for mobile bottom bars.
 */
const BottomNavLink = memo(({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex flex-col items-center justify-center transition-all",
        isActive ? "text-blue-700 bg-blue-50/50 rounded-xl px-4 py-1" : "text-slate-400"
      )
    }
  >
    <span className="material-symbols-outlined">{icon}</span>
    <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest font-bold">
      {label}
    </span>
  </NavLink>
));

BottomNavLink.displayName = "BottomNavLink";

/**
 * BottomNav Component (Consolidated)
 * Mobile-specific navigation bar.
 * Role-aware: Adjusts links based on Resident vs Admin status.
 */
const BottomNav = memo(({ toggleSidebar }) => {
  const { userRole } = useAuth() || {};
  const isResident = userRole === ROLES.RESIDENT;

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-2 py-3 pb-safe bg-white/80 backdrop-blur-2xl border-t border-white/40 z-50 md:hidden shadow-lg">
      <BottomNavLink to={ROUTES.DASHBOARD} icon="home" label="Home" />

      {isResident ? (
        <>
          <BottomNavLink to={ROUTES.SMART_AQUA_MONITOR} icon="monitor_heart" label="Monitor" />
          <BottomNavLink to={ROUTES.ALERTS} icon="notifications" label="Alerts" />
        </>
      ) : (
        <>
          <BottomNavLink to={ROUTES.ADMIN_USER_MANAGEMENT} icon="group" label="Users" />
          <BottomNavLink to={ROUTES.ALERTS} icon="notifications_active" label="Alerts" />
        </>
      )}

      <button
        onClick={toggleSidebar}
        className="flex flex-col items-center justify-center text-slate-400 active:scale-95 transition-transform"
      >
        <span className="material-symbols-outlined">menu</span>
        <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest font-bold">
          More
        </span>
      </button>
    </nav>
  );
});

BottomNav.displayName = "BottomNav";

export { BottomNav, BottomNavLink };
export default BottomNav;
