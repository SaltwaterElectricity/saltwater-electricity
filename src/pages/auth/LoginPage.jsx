import { useState, useCallback, useMemo } from "react";
import LoginModal from "../../components/ui/LoginModal";
import { User, ShieldCheck } from "lucide-react";
import { cn } from "../../utils/cn";

// 1. CONSTANTS: Moved outside to prevent re-allocation on render
const ROLES = {
  USER: {
    id: "user",
    label: "Client Login",
    icon: User,
    theme: "light",
    styles: {
      card: "bg-white border-slate-200 shadow-sm",
      iconBox: "bg-blue-50 text-blue-600 group-hover:bg-blue-600",
      text: "text-slate-700"
    }
  },
  ADMIN: {
    id: "admin",
    label: "Admin / Staff",
    icon: ShieldCheck,
    theme: "dark",
    styles: {
      card: "bg-slate-900 border-slate-800 shadow-xl",
      iconBox: "bg-slate-800 text-slate-400 group-hover:bg-red-500",
      text: "text-slate-400 group-hover:text-white"
    }
  }
};

const LoginPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialRole, setInitialRole] = useState(ROLES.USER.id);

  // 2. PERFORMANCE: Memoized handler for opening the modal
  const openLogin = useCallback((roleId) => {
    setInitialRole(roleId);
    setIsModalOpen(true);
  }, []);

  // 3. PERFORMANCE: Memoized roles array for the grid
  const rolesList = useMemo(() => Object.values(ROLES), []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 antialiased">
      
      {/* HEADER: 8pt grid (mb-16 = 128px) */}
      <header className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
          SmartAqua <span className="text-blue-600">Portal</span>
        </h1>
        <p className="text-slate-500 mt-3 text-xs font-bold uppercase tracking-[0.3em] opacity-60">
          Secure Access Gateway
        </p>
      </header>
      
      {/* GRID: Responsive gap-8 (32px) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-2xl">
        {rolesList.map((role) => (
          <button 
            key={role.id}
            onClick={() => openLogin(role.id)}
            className={cn(
              "group p-10 rounded-[40px] transition-all flex flex-col items-center gap-6 active:scale-95",
              "hover:shadow-2xl hover:-translate-y-2 duration-500",
              role.styles.card
            )}
          >
            {/* ICON CONTAINER: w-20 (80px) */}
            <div className={cn(
              "w-20 h-20 rounded-[28px] flex items-center justify-center transition-all duration-500",
              role.styles.iconBox
            )}>
              <role.icon className="w-10 h-10 transition-colors duration-500 group-hover:text-white" />
            </div>

            {/* LABEL SECTION */}
            <span className={cn(
              "font-black uppercase tracking-[0.25em] text-[10px] transition-colors duration-500",
              role.styles.text
            )}>
              {role.label}
            </span>
          </button>
        ))}
      </div>

      {/* LOGIN MODAL */}
      <LoginModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        defaultRole={initialRole}
      />
    </div>
  );
};

export default LoginPage;