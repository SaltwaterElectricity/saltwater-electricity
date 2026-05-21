import { BottomNavLink } from "./BottomNavLink";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../context/useAuth";
import { ROLES } from "../constants/roles";

/**
 * BottomNav Component
 * Mobile-specific navigation bar.
 * Role-aware: Adjusts links based on Resident vs Admin status.
 */
export const BottomNav = ({ toggleSidebar }) => {
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
};

export default BottomNav;
