import { NavLink } from "react-router-dom";
import { cn } from "../utils/cn";

/**
 * BottomNavLink Component
 * Standardized navigation item for mobile bottom bars.
 * Implements active state styling and Material Symbols.
 */
export const BottomNavLink = ({ to, icon, label }) => (
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
);

export default BottomNavLink;
