import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useTimeout } from "../../hooks/useTimeout";
import { Sidebar } from "./Sidebar";
import { NavbarProfile } from "./NavbarProfile";
import { SettingsModal } from "../modal/SettingsModal";
import { useAuth } from "../../context/AuthContext"; 
import { Menu, LayoutDashboard } from "lucide-react";
import { SpinnerIcon } from "../../components/ui";
import { cn } from "../../utils/cn";

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  const { currentUser, isAdmin, loading } = useAuth() || {}; 
  const currentUid = currentUser?.uid || "";

  useTimeout(isAdmin ? 1800000 : null);

 if (loading && !currentUid) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <SpinnerIcon />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm/5">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all active:scale-95"
            >
              <Menu size={20} />
            </button>
            
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
              <LayoutDashboard size={12} className="text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                Unisan Monitoring <span className="text-slate-300">|</span> Facility 01
              </span>
            </div>

            <div className="lg:hidden flex items-center gap-1">
              <span className="font-black text-blue-600 tracking-tighter text-sm">SMART</span>
              <span className="font-black text-slate-900 tracking-tighter text-[10px]">AQUA</span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                System Online
              </span>
            </div>

            <NavbarProfile currentUid={currentUid} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
          <div className={cn(
            "p-4 md:p-8 lg:p-12 min-h-full flex flex-col",
            "animate-in fade-in slide-in-from-bottom-2 duration-700"
          )}>
            <div className="max-w-7xl mx-auto w-full flex-1">
              {children || <Outlet />}
            </div>

            <footer className="mt-20 py-8 border-t border-slate-100/60 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] leading-relaxed">
                © 2026 SmartAqua Infrastructure <br className="md:hidden" /> 
                <span className="hidden md:inline"> • </span> 
                Facility Monitoring Unisan
              </p>
            </footer>
          </div>
        </main>
      </div>
      <SettingsModal uid={currentUid}/>
    </div>
  );
};

export default MainLayout;