<<<<<<< HEAD
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import LoginForm from "../../components/auth/LoginForm";
import LoginHero from "../../components/auth/LoginHero";
import { AccessGrantedModal } from "../../components/modal";

const LoginPage = () => {
  const { currentUser } = useAuth();
  const [successData, setSuccessData] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  // 🛡️ SECURITY REDIRECT: Refactored to avoid Race Conditions
  useEffect(() => {
    // Only redirect if:
    // 1. A session is present (currentUser)
    // 2. We don't have local success data yet (!successData)
    // 3. We are not currently transitioning (!isTransitioning)
    // This prevents the instant AuthContext redirect from unmounting the modal sequence.
    if (currentUser && !successData && !isTransitioning) {
      navigate("/", { replace: true });
    }
  }, [currentUser, successData, isTransitioning, navigate]);

  const handleLoginStart = useCallback(() => {
    setIsTransitioning(true);
  }, []);

  const handleLoginError = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  const handleLoginSuccess = (data) => {
    // SYNC: Ensure transition block remains active while setting success data
    setIsTransitioning(true);
    setSuccessData(data);
  };

  const handleRedirect = useCallback(() => {
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen w-full bg-[#f7f9fb] relative antialiased flex flex-col overflow-hidden">
      {/* Background Decorative Gradients (Maritime Vibe) */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* Accent Blurs from code.html */}
        <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] bg-secondary-container/5 rounded-full blur-[70px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-secondary-container/5 rounded-full blur-[70px]" />
      </div>

      {/* Main Entry Portal Content */}
      {!successData && (
        <main className="flex-grow flex items-center justify-center px-6">
          <div className="flex flex-col md:flex-row items-center justify-center max-w-6xl w-full gap-12 md:gap-32 animate-in fade-in duration-500">
            {/* Left Side: Branding */}
            <div className="hidden md:block scale-110">
              <LoginHero />
            </div>

            {/* Right Side: Auth Form */}
            <div className="w-full max-w-[390px] relative z-10">
              <div className="glass-panel p-7 shadow-2xl border border-white/40 bg-white min-h-[490px] rounded-[18px] flex flex-col">
                <div className="text-center mb-5">
                  <h1 className="text-2xl font-bold text-on-surface mb-2 font-display">
                    Welcome Back
                  </h1>
                  <p className="text-outline text-xs font-body-md">Saltwater Device Monitoring</p>
                  <p className="text-outline text-[11px] font-medium mt-1 font-body-md">
                    Please enter the needed information.
                  </p>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  <LoginForm
                    onLoginSuccess={handleLoginSuccess}
                    onLoginStart={handleLoginStart}
                    onLoginError={handleLoginError}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Centered Modal for Successful Login (Portaled via ModalBackdrop) */}
      <AccessGrantedModal
        key={successData ? "success" : "idle"}
        isOpen={!!successData}
        userData={successData}
        onFinished={handleRedirect}
=======
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
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
      />
    </div>
  );
};

<<<<<<< HEAD
export default LoginPage;
=======
export default LoginPage;
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
