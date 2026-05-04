import { useState, useEffect, memo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "../../utils/cn";
import { ShieldCheck, User, X, AlertCircle, Loader2 } from "lucide-react";
import { loginUser, logoutUser } from "../../services/auth.service";
import { logLoginSession } from "../../services/session.service";
import { ROLES } from "../../constants/roles";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { ROUTES, ROLE_LANDING_PAGES } from "../../constants/routes";
import { appError } from "../../utils/appError";
import { useBruteForce } from "../../hooks/useBruteForce";

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
    watch,
    formState: { errors } 
  } = useForm({ mode: "onBlur" });

  const watchedEmail = watch("email");
  const watchedPassword = watch("password");
  const trackingId = watchedEmail ? watchedEmail.toLowerCase().replace(/[^a-zA-Z0-9]/g, '') : "";

  // Brute Force logic
  const { isLocked, formattedTime, recordFailedAttempt } = useBruteForce(trackingId);

  useEffect(() => {
    if (isOpen) {
      setRole(defaultRole);
      reset();
      setAuthError("");
    }
  }, [defaultRole, reset, isOpen]);

  // Clear auth error when user starts typing to provide immediate feedback
  useEffect(() => {
    setAuthError("");
  }, [watchedEmail, watchedPassword]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    // Immediate check using current state
    if (isLocked) {
      setAuthError(`Account locked. Please try again in ${formattedTime}.`);
      return;
    }

    setIsSubmitting(true);
    setAuthError("");
    
    try {
      const { user, userData } = await loginUser(data.email, data.password);

      if (!userData || !user?.uid) {
        throw new appError("Account context missing. Please contact system administrator.", true, "auth/missing-context");
      }

      // 3. ROLE MISMATCH GUARD
      const isStaff = userData.role === ROLES.ADMIN || userData.role === ROLES.SUPER_ADMIN;
      if (role === ROLES.ADMIN && !isStaff) {
        await logoutUser();
        throw new appError("Unauthorized access. This area is reserved for staff/admin only.", true, "auth/unauthorized");
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
      // Record the failure for brute force tracking
      await recordFailedAttempt();
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
        
        <div className="relative w-[92%] sm:w-full max-w-[440px] bg-white/70 backdrop-blur-xl border border-white/40 rounded-[32px] shadow-[0_8px_32px_0_rgba(0,82,204,0.08)] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh]">
          
          {/* TAB SELECTOR: Uses 8pt grid (p-2, py-3) */}
          <div className="flex bg-slate-50/50 p-2 gap-2 shrink-0">
            <button 
              type="button"
              disabled={isSubmitting}
              onClick={() => setRole(ROLES.RESIDENT)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all",
                role === ROLES.RESIDENT ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600",
                isSubmitting && "opacity-50 cursor-not-allowed"
              )}
            >
              <User size={14} /> Client
            </button>
            <button 
              type="button"
              disabled={isSubmitting}
              onClick={() => setRole(ROLES.ADMIN)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all",
                role === ROLES.ADMIN ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600",
                isSubmitting && "opacity-50 cursor-not-allowed"
              )}
            >
              <ShieldCheck size={14} /> Admin
            </button>
          </div>

          <div className="p-8 overflow-y-auto custom-scrollbar-hide">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-['Space_Grotesk'] font-bold text-slate-900 tracking-tight">
                  {role === ROLES.ADMIN ? "System Access" : "Welcome Back"}
                </h2>

                <p className="text-xs font-['Inter'] text-slate-500 mt-1 font-medium italic">
                  SmartAqua Security Node
                </p>
              </div>
              {!isSubmitting && (
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              )}
            </div>

            {/* ERROR CONTAINER: Fixed height prevents layout shifts without overlapping */}
            <div className="min-h-[64px] mb-4 flex items-center">
              {(authError || isLocked) && (
                <div className="w-full p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex gap-3 items-center animate-in slide-in-from-top-2 pointer-events-auto shadow-sm">
                  <AlertCircle size={18} className="text-red-500 shrink-0" />
                  <p className="text-[10px] font-['Inter'] font-bold text-red-700 uppercase tracking-widest leading-tight">
                    {isLocked 
                      ? `Account locked. Please try again in ${formattedTime}.` 
                      : authError}
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-['Inter'] font-bold uppercase text-slate-400 tracking-wider px-1">Email Address</label>
                <input 
                  {...register("email", { 
                    required: "Required",
                    pattern: { value: /^\S+@\S+$/i, message: "Invalid format" }
                  })}
                  disabled={isSubmitting || isLocked}
                  placeholder="name@example.com"
                  className={cn(
                    "w-full h-12 px-4 bg-white/50 border rounded-xl outline-none transition-all text-sm font-['Inter']",
                    errors.email ? "border-red-500" : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  )}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[11px] font-['Inter'] font-bold uppercase text-slate-400 tracking-wider">Password</label>
                  <button 
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-[10px] font-['Inter'] font-bold text-blue-600 uppercase hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <input 
                  type="password"
                  {...register("password", { required: "Required" })}
                  disabled={isSubmitting || isLocked}
                  placeholder="••••••••"
                  className={cn(
                    "w-full h-12 px-4 bg-white/50 border rounded-xl outline-none transition-all text-sm font-['Inter']",
                    errors.password ? "border-red-500" : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  )}
                />
              </div>

              {/* BUTTON WITH SPINNER AND VERIFYING STATE */}
              <button
                disabled={isSubmitting || isLocked}
                className={cn(
                  "w-full h-14 rounded-2xl font-bold uppercase text-[11px] tracking-[0.2em] shadow-lg transition-all active:scale-95 mt-4 flex items-center justify-center gap-3",
                  role === ROLES.ADMIN ? "bg-slate-900 text-white" : "bg-blue-600 text-white",
                  (isSubmitting || isLocked) && "opacity-80 cursor-wait active:scale-100 shadow-none bg-slate-200 text-slate-400"
                )}
              >
                {isLocked ? (
                  <span className="uppercase text-[11px] font-['Inter']">System Locked</span>
                ) : isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span className="animate-pulse font-['Inter']">Verifying Context...</span>
                  </>
                ) : (
                  <span className="font-['Inter']">Authorize as {role}</span>
                )}
              </button>
            </form>

            {/* FOOTER: Multiple of 8px (mt-8, pt-6, gap-2) */}
            <footer className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-[11px] font-['Inter'] font-medium text-slate-500">New user or missing device?</p>
              <div className="flex flex-col gap-2 mt-3">
                <Link 
                  to="/get-device" 
                  onClick={onClose}
                  className="text-[10px] font-['Inter'] font-bold text-blue-600 uppercase tracking-widest hover:text-blue-700"
                >
                  How to Get a Device
                </Link>
                <a 
                  href="mailto:admin@smartaqua.com" 
                  className="text-[10px] font-['Inter'] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600"
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
