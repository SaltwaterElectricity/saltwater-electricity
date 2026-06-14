import { NavbarProfile } from "./NavbarProfile";
import { cn } from "../utils/cn";
import { useUI } from "../context/useUI";
import { useAuth } from "../context/useAuth";
import { ROLES } from "../constants/roles";

/**
 * NavbarHeader Component
 * Standardized top navigation bar adhering to AlonKuryente visual language.
 * branding text visibility is linked to sidebar state to prevent redundancy.
 */
export const NavbarHeader = ({ currentUid }) => {
  const { isSidebarCollapsed } = useUI();
  const { userRole } = useAuth();
  const isResident = userRole === ROLES.RESIDENT;

  // For residents, we hide header branding because their sidebar is always open on desktop
  // and already contains the branding. For admins, we hide it if the sidebar is expanded.
  const shouldShowBranding = !isResident && isSidebarCollapsed;

  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/40 flex justify-between items-center px-gutter md:px-margin py-4 w-full">
      <div className="flex items-center space-x-8">
        <div
          className={cn(
            "flex items-center gap-2.5 transition-all duration-500",
            shouldShowBranding
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-4 pointer-events-none"
          )}
        >
          <div className="flex flex-col items-center text-center">
            <h1 className="text-sm font-black tracking-tight text-on-surface leading-none uppercase">
              Device Monitoring
            </h1>
            <p className="text-[10px] font-bold text-primary tracking-[0.5px] mt-1 uppercase">
              Saltwater Electricity
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="hover:bg-slate-100/50 rounded-full p-2 text-slate-600 relative transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full shadow-[0_0_8px_rgba(186,26,26,0.4)]" />
        </button>

        {/* Suggest Settings */}
        <button className="hover:bg-slate-100/50 rounded-full p-2 text-slate-600 transition-colors">
          <span className="material-symbols-outlined">settings_suggest</span>
        </button>

        {/* Profile / Avatar with defined blue border */}
        <div className="border-2 border-blue-100 rounded-full">
          <NavbarProfile currentUid={currentUid} />
        </div>
      </div>
    </header>
  );
};
