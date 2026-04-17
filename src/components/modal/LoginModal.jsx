import { useState, useEffect, memo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "../../utils/cn";
import { ShieldCheck, User, X, AlertCircle, Loader2 } from "lucide-react";
import { loginUser, logoutUser } from "../../services/auth.service";
import { logLoginSession } from "../../services/session.service";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { ROUTES, ROLE_LANDING_PAGES } from "../../constants/routes";

const LoginModal = ({ isOpen, onClose, defaultRole }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState(defaultRole);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors } 
  } = useForm({ mode: "onBlur" });

  useEffect(() => {
    if (isOpen) {
      setRole(defaultRole);
      reset();
      setAuthError("");
    }
  }, [defaultRole, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setAuthError("");
    
    try {
      const { user, userData } = await loginUser(data.email, data.password);

      if (!userData || !user?.uid) {
        throw new Error("Account context missing. Please contact system administrator.");
      }

      // 3. ROLE MISMATCH GUARD
      const isStaff = userData.role === "admin" || userData.role === "superAdmin";
      if (role === "admin" && !isStaff) {
        await logoutUser();
        throw new Error("Unauthorized access. This area is reserved for staff/admin only.");
      }

      // 4. CRITICAL SECURITY CHECK: Force password change
      if (userData.requiresPasswordChange) {
        sessionStorage.setItem("pending_uid", user.uid);
        navigate(ROUTES.FORCE_PASSWORD_CHANGE, { replace: true });
        onClose();
        return;
      }

      localStorage.setItem("last_activity", Date.now().toString());

      await logLoginSession(userData.uid);

      // 6. DYNAMIC ROLE-BASED ROUTING with existence check
      const path = ROLE_LANDING_PAGES[userData.role] || ROUTES.UNAUTHORIZED;

      onClose();
      setTimeout(() => {
        navigate(path, { replace: true });
      }, 200);
    } catch (err) {
      setAuthError(err.message);
      sessionStorage.removeItem("is_verified");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* BACKDROP: Non-clickable during submission to prevent interruptions */}
        <div 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
          onClick={!isSubmitting ? onClose : undefined} 
        />
        
        <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
          
          {/* TAB SELECTOR: Uses 8pt grid (p-2, py-3) */}
          <div className="flex bg-slate-50 p-2 gap-2">
            <button 
              type="button"
              disabled={isSubmitting}
              onClick={() => setRole("user")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all",
                role === "user" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600",
                isSubmitting && "opacity-50 cursor-not-allowed"
              )}
            >
              <User size={14} /> Client
            </button>
            <button 
              type="button"
              disabled={isSubmitting}
              onClick={() => setRole("admin")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all",
                role === "admin" ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600",
                isSubmitting && "opacity-50 cursor-not-allowed"
              )}
            >
              <ShieldCheck size={14} /> Admin
            </button>
          </div>

          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {role === "admin" ? "System Access" : "Welcome Back"}
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-medium italic">
                  SmartAqua Security Node
                </p>
              </div>
              {!isSubmitting && (
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              )}
            </div>

            {authError && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex gap-3 items-center animate-in slide-in-from-left-2">
                <AlertCircle size={18} className="text-red-500 shrink-0" />
                <p className="text-[10px] font-bold text-red-700 uppercase tracking-widest leading-tight">
                  {authError}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-tight px-1">Email Address</label>
                <input 
                  {...register("email", { 
                    required: "Required",
                    pattern: { value: /^\S+@\S+$/i, message: "Invalid format" }
                  })}
                  disabled={isSubmitting}
                  placeholder="name@example.com"
                  className={cn(
                    "w-full h-12 px-4 bg-slate-50 border rounded-xl outline-none transition-all text-sm",
                    errors.email ? "border-red-500" : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  )}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-tight">Password</label>
                  <button 
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-[9px] font-bold text-blue-600 uppercase hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <input 
                  type="password"
                  {...register("password", { required: "Required" })}
                  disabled={isSubmitting}
                  placeholder="••••••••"
                  className={cn(
                    "w-full h-12 px-4 bg-slate-50 border rounded-xl outline-none transition-all text-sm",
                    errors.password ? "border-red-500" : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  )}
                />
              </div>

              {/* BUTTON WITH SPINNER AND VERIFYING STATE */}
              <button
                disabled={isSubmitting}
                className={cn(
                  "w-full h-14 rounded-2xl font-bold uppercase text-[11px] tracking-[0.2em] shadow-lg transition-all active:scale-95 mt-4 flex items-center justify-center gap-3",
                  role === "admin" ? "bg-slate-900 text-white" : "bg-blue-600 text-white",
                  isSubmitting && "opacity-80 cursor-wait active:scale-100"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span className="animate-pulse">Verifying Context...</span>
                  </>
                ) : (
                  `Authorize as ${role}`
                )}
              </button>
            </form>

            {/* FOOTER: Multiple of 8px (mt-8, pt-6, gap-2) */}
            <footer className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-[11px] font-medium text-slate-500">New user or missing device?</p>
              <div className="flex flex-col gap-2 mt-3">
                <Link 
                  to="/get-device" 
                  onClick={onClose}
                  className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:text-blue-700"
                >
                  How to Get a Device
                </Link>
                <a 
                  href="mailto:admin@smartaqua.com" 
                  className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600"
                >
                  Contact Admin
                </a>
              </div>
            </footer>
          </div>
        </div>
      </div>

      <ForgotPasswordModal 
        isOpen={isForgotModalOpen} 
        onClose={() => setIsForgotModalOpen(false)} 
      />
    </>
  );
};

export default memo(LoginModal);