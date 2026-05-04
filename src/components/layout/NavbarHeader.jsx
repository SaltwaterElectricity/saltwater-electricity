import { NavLink } from "react-router-dom";
import { NavbarProfile } from "./NavbarProfile";
import { ROUTES } from "../../constants/routes";
import { cn } from "../../utils/cn";

/**
 * NavbarHeader Component
 * Standardized top navigation bar adhering to AlonKuryente visual language.
 * Updated based on code.html specifications.
 */
export const NavbarHeader = ({ currentUid }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/40 flex justify-between items-center px-6 py-4 w-full">
      <div className="flex items-center space-x-8">
        <span className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-cyan-500 bg-clip-text text-transparent font-['Space_Grotesk']">
          AlonKuryente
        </span>
        <nav className="hidden lg:flex space-x-6 font-['Space_Grotesk']">
          <NavLink 
            to={ROUTES.DASHBOARD} 
            className={({ isActive }) => cn(
              "pb-1 font-medium transition-colors",
              isActive ? "text-blue-700 border-b-2 border-blue-600" : "text-slate-600 hover:text-blue-500"
            )}
          >
            Live View
          </NavLink>
          <NavLink 
            to="/grid-status" 
            className="text-slate-600 hover:text-blue-500 transition-colors font-medium"
          >
            Grid Status
          </NavLink>
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative hidden sm:block">
          <input 
            className="bg-slate-100/50 border-none rounded-full px-4 py-2 text-sm w-64 focus:ring-2 focus:ring-blue-500 transition-all outline-none" 
            placeholder="Search grid components..." 
            type="text"
          />
        </div>
        
        {/* Notifications */}
        <button className="hover:bg-slate-100/50 rounded-full p-2 text-slate-600 relative transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full shadow-[0_0_8px_rgba(186,26,26,0.4)]"></span>
        </button>

        {/* Suggest Settings */}
        <button className="hover:bg-slate-100/50 rounded-full p-2 text-slate-600 transition-colors">
          <span className="material-symbols-outlined">settings_suggest</span>
        </button>
        
        {/* Profile / Avatar with defined blue border */}
        <div className="border-2 border-blue-100 rounded-full overflow-hidden">
          <NavbarProfile currentUid={currentUid} />
        </div>
      </div>
    </header>
  );
};

