import { memo } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "../utils/cn";
import { ROUTES } from "../constants/routes";

/**
 * Navigation Link Component
 * Handles active states and hover transitions with role-based theming.
 */
export const SidebarLink = memo(
  ({ to, icon, label, badgeCount, isResident, isSuperAdmin, isCollapsed, onClick }) => (
    <NavLink
      to={to}
      end={to === ROUTES.DASHBOARD}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center transition-all relative group",
          "rounded-xl",
          isActive
            ? isResident
              ? "bg-white/15 text-white font-semibold shadow-black/5"
              : isSuperAdmin
                ? "bg-[#001fff] text-white font-semibold shadow-lg shadow-blue-900/40 active:scale-95"
                : "bg-blue-600 text-white font-semibold shadow-lg shadow-blue-900/20 active:scale-95"
            : isResident
              ? "text-white/70 hover:text-white hover:bg-white/10"
              : isSuperAdmin
                ? "text-[#c2c6d8] hover:text-white hover:bg-white/5 hover:translate-x-1 active:scale-95"
                : "text-slate-400 hover:text-white hover:bg-white/10 hover:translate-x-1 active:scale-95",
          isCollapsed && !isResident
            ? "justify-center px-0 mx-auto w-10 gap-0 py-3"
            : "gap-3 px-2 py-3"
        )
      }
    >
      <span
        className={cn(
          "material-symbols-outlined flex-shrink-0 transition-transform duration-300",
          isCollapsed && !isResident && "scale-110",
          !isResident && "text-[22px]",
          // Active icon fill for better visibility
          "group-[.active]:[font-variation-settings:'FILL'_1]"
        )}
      >
        {icon}
      </span>
      <span
        className={cn(
          "font-medium whitespace-nowrap overflow-hidden transition-all duration-300",
          isResident ? "text-[14px]" : "text-sm",
          !isResident && (isCollapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100")
        )}
      >
        {label}
      </span>
      {badgeCount > 0 && (
        <span
          className={cn(
            isResident
              ? "bg-primary/50 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center ml-auto"
              : cn(
                  "absolute rounded-full ring-2 ring-[#191b24] transition-all duration-300",
                  isCollapsed
                    ? "right-0 top-1 w-2.5 h-2.5 bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]"
                    : "right-3 top-3 w-2 h-2 bg-blue-600"
                )
          )}
        >
          {isResident ? badgeCount : ""}
        </span>
      )}

      {/* Tooltip for collapsed state (Admin Only) */}
      {isCollapsed && !isResident && (
        <div className="absolute left-14 ml-2 px-3 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[100] shadow-2xl border border-white/10 pointer-events-none">
          {label}
          {/* Tooltip Arrow */}
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-slate-900" />
        </div>
      )}
    </NavLink>
  )
);

SidebarLink.displayName = "SidebarLink";
