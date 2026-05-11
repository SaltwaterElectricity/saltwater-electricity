import { BottomNavLink } from "./BottomNavLink";
import { ROUTES } from "../constants/routes";

/**
 * BottomNav Component
 * Mobile-specific navigation bar.
 * Adheres to Glassmorphism and 8-point grid standards.
 */
export const BottomNav = ({ toggleSidebar }) => (
  <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-2 py-3 pb-safe bg-white/80 backdrop-blur-2xl border-t border-white/40 z-50 md:hidden">
    <BottomNavLink to={ROUTES.DASHBOARD} icon="dashboard" label="Dashboard" />
    <BottomNavLink to={ROUTES.ADMIN_USER_MANAGEMENT} icon="group" label="Users" />
    <BottomNavLink to="/alerts" icon="notifications" label="Alerts" />
    <BottomNavLink to="/trends" icon="query_stats" label="Trends" />
    <button
      onClick={toggleSidebar}
      className="flex flex-col items-center justify-center text-slate-400"
    >
      <span className="material-symbols-outlined">menu</span>
      <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest font-bold">
        More
      </span>
    </button>
  </nav>
);

export default BottomNav;
