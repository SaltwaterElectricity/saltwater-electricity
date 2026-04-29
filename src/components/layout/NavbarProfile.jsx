import { useState, useEffect, useRef, memo, useCallback } from "react";
import { useProfile } from "../../hooks/useProfile";
import { logoutUser } from "../../services/auth.service";
import { useUI } from "../../context/UIContext";
import { useNotification } from "../../context/NotificationContext";
import { LogOut, Settings } from "lucide-react"; 
import { cn } from "../../utils/cn";
import SpinnerIcon from "../ui/SpinnerIcon"; 

export const NavbarProfile = memo(({ currentUid = "" }) => {
  const dropdownRef = useRef(null);

  const { profile, loading } = useProfile(currentUid);
  const { openSettings } = useUI();
  const { showNotification } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const getInitials = useCallback(() => {
    const fLetter = profile?.firstName?.[0] || "";
    const lLetter = profile?.lastName?.[0] || "";
    return fLetter && lLetter ? `${fLetter}${lLetter}` : fLetter || lLetter || "A";
  }, [profile]);

  const handleToggle = () => setIsOpen((prev) => !prev);

  // 🛰️ DISPATCH EVENT TO OPEN MODAL (Pumupunta sa SettingsModal)
  const handleOpenSettings = (tabName) => {
    setIsOpen(false); // Isara muna ang dropdown
    openSettings(tabName);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser(); 
    } catch (_error) {
      showNotification("Terminating session... Forcing secure reset.", "warning");

      sessionStorage.clear();
      localStorage.clear();

      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (loading) return <div className="h-10 w-10 animate-pulse bg-slate-200 rounded-2xl" />;

  return (
    <div className="relative antialiased" ref={dropdownRef}>
      
      <button 
        onClick={handleToggle}
        disabled={isLoggingOut}
        className="h-10 w-10 rounded-2xl bg-slate-900 border border-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-lg hover:bg-slate-800 transition-all uppercase tracking-wider focus:ring-2 focus:ring-blue-500 outline-none"
      >
        {getInitials()}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-100 rounded-3xl shadow-xl p-2 space-y-1 z-50 animate-in fade-in slide-in-from-top-5 duration-200">
          <div className="flex items-center gap-3 p-3 border-b border-slate-50">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-100 uppercase flex-shrink-0">
              {getInitials()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-slate-900 truncate">
                {profile?.firstName} {profile?.lastName}
              </p>
              <p className="text-[10px] text-slate-400 font-bold truncate tracking-tight">
                {profile?.email || "Account Active"}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            
            {/* ⚙️ PINAG-ISANG PROFILE SETTINGS BUTTON */}
            <button 
              onClick={() => handleOpenSettings("profile")} 
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 p-3 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Settings className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" /> 
              Profile Settings
            </button>

            <button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={cn(
                "w-full flex items-center justify-between p-3 text-xs font-bold rounded-xl transition-colors group",
                "text-red-600 hover:bg-red-50",
                isLoggingOut && "opacity-70 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4 text-red-500 transition-transform group-hover:-translate-x-1" /> 
                <span>{isLoggingOut ? "Signing out..." : "Logout Session"}</span>
              </div>
              {isLoggingOut && <SpinnerIcon className="w-4 h-4 animate-spin text-red-500" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
});