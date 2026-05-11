import { useState, useEffect, useRef, memo, useCallback } from "react";
import { useProfile } from "../hooks/useProfile";
import { logoutUser } from "../services/auth.service";
import { useUI } from "../context/useUI";
import { useNotification } from "../context/useNotification";
import { cn } from "../utils/cn";
import SpinnerIcon from "../components/ui/SpinnerIcon"; 
import { ConfirmationModal } from "../components/modal/ConfirmationModal";

export const NavbarProfile = memo(({ currentUid = "" }) => {
  const dropdownRef = useRef(null);

  const { profile, loading } = useProfile(currentUid);
  const { openSettings } = useUI();
  const { showNotification } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const getInitials = useCallback(() => {
    const fLetter = profile?.firstName?.[0] || "";
    const lLetter = profile?.lastName?.[0] || "";
    return fLetter && lLetter ? `${fLetter}${lLetter}` : fLetter || lLetter || "A";
  }, [profile]);

  const handleToggle = () => setIsOpen((prev) => !prev);

  const handleOpenSettings = (tabName) => {
    setIsOpen(false);
    openSettings(tabName);
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    setIsLogoutModalOpen(true);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser(); 
      window.location.href = "/login";
    } catch {
      showNotification("Terminating session... Forcing secure reset.", "warning");
      sessionStorage.clear();
      localStorage.clear();
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
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

  if (loading) return <div className="h-10 w-10 animate-pulse bg-slate-200 rounded-full" />;

  return (
    <div className="relative antialiased" ref={dropdownRef}>

      <button 
        onClick={handleToggle}
        disabled={isLoggingOut}
        className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden border-2 border-blue-100 hover:border-blue-500 transition-all flex items-center justify-center font-bold text-blue-700 shadow-sm active:scale-95"
      >
        {getInitials().toUpperCase()}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-white/90 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl p-2 space-y-1 z-50 animate-in fade-in slide-in-from-top-5 duration-200">
          <div className="flex items-center gap-3 p-3 border-b border-slate-50">
            <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm border border-blue-100 uppercase flex-shrink-0 font-display">
              {getInitials()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-slate-900 truncate">
                {profile?.firstName} {profile?.lastName}
              </p>
              <p className="text-[10px] text-slate-400 font-bold truncate tracking-tight italic">
                {profile?.email || "Account Active"}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <button 
              onClick={() => handleOpenSettings("profile")} 
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 p-3 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-lg text-slate-400 group-hover:text-blue-500 transition-colors">settings</span> 
              Account Settings
            </button>

            <button 
              onClick={handleLogoutClick}
              disabled={isLoggingOut}
              className={cn(
                "w-full flex items-center justify-between p-3 text-xs font-bold rounded-xl transition-colors group",
                "text-error hover:bg-red-50",
                isLoggingOut && "opacity-70 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg text-error transition-transform group-hover:-translate-x-1">logout</span> 
                <span>{isLoggingOut ? "Signing out..." : "Logout Session"}</span>
              </div>
              {isLoggingOut && <SpinnerIcon className="w-4 h-4 animate-spin text-error" />}
            </button>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        isSubmitting={isLoggingOut}
        title="Confirm Sign Out"
        description="Terminating your session will restrict global visibility until next authentication."
        confirmText="Log Out"
        variant="danger" 
      />
    </div>
    );
    });

    NavbarProfile.displayName = 'NavbarProfile';