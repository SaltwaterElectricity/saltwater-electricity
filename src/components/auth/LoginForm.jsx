import { useState, memo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, getFullUserData } from "../../services/auth.service";
import { ROLES } from "../../constants/roles";
import { PasswordInput } from "../password-change";
import { SpinnerIcon} from "../ui";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { appError } from "../../utils/appError";
import { useBruteForce } from "../../hooks/useBruteForce";


const LoginForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  
  // 1. MODAL STATE: Controls the visibility of the reset flow
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors } 
  } = useForm({ mode: "onBlur" });

  // 2. BRUTE FORCE PROTECTION: Track attempts by sanitized email
  const emailInput = watch("email");
  const trackingId = emailInput ? emailInput.replace(/\./g, "_") : null;
  const { isLocked, formattedTime, recordFailedAttempt } = useBruteForce(trackingId);

  const onSubmit = async (data) => {
    if (isLocked) return;
    setIsSubmitting(true);
    setAuthError(""); 

    try {
      const userCredential = await loginUser(data.email, data.password);
      const uid = userCredential.user.uid;

      sessionStorage.setItem("is_verified", "true");

      const userData = await getFullUserData(uid);

      if (!userData) {
        throw new appError("Account not found. Please contact your system administrator.", true, "auth/user-not-found");
      }

      if (userData.requiresPasswordChange) {
        navigate("/force-password-change");
        return;
      }

      switch (userData.role) {
        case ROLES.SUPER_ADMIN:
          navigate("/admin", { replace: true });
          break;
        case ROLES.ADMIN:
          navigate("/admin/dashboard", { replace: true });
          break;
        case "technician":
          navigate("/tech/controls", { replace: true });
          break;
        default:
          navigate("/dashboard", { replace: true });
      }

    } catch (err) {
      setAuthError(err.message);
      sessionStorage.removeItem("is_verified");
      // Record failed attempt for brute force protection
      if (err.code !== "auth/user-not-found") {
        await recordFailedAttempt();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-8">
      <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8 border border-slate-100 animate-in fade-in zoom-in duration-500 relative">
        
        <header className="mb-4 text-center">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-sm text-slate-500 mt-2">Sign in to monitor your water quality system.</p>
        </header>

        {/* Layout stability container for messages */}
        <div className="h-8 overflow-hidden flex items-center justify-center mb-4">
          {(authError || isLocked) && (
            <div className="text-center animate-in slide-in-from-top-2 duration-300">
              <span className="text-red-500 text-[10px] font-bold uppercase tracking-tighter">
                {isLocked ? (
                  <>Account Locked: Try again in <span className="font-mono">{formattedTime}</span></>
                ) : authError}
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-tight">
              Email Address
            </label>
            <input
              type="email"
              {...register("email", { 
                required: "Email is required",
                pattern: { value: /^\S+@\S+$/i, message: "Invalid email format" }
              })}
              placeholder="name@example.com"
              className={`w-full p-3 h-14 border rounded-xl text-sm outline-none transition-all shadow-sm
                ${errors.email ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'}`}
            />
            {errors.email && (
              <span className="text-[10px] text-red-600 font-bold uppercase mt-1">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="relative">
            <PasswordInput
              label="Password"
              name="password"
              register={register}
              errors={errors}
              validation={{ required: "Password is required" }}
            />
            
            <div className="flex justify-end mt-2">
              <button 
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="text-[10px] font-bold text-blue-600 uppercase tracking-tight hover:text-blue-700 transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLocked}
            className="w-full h-14 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl shadow-lg 
                       transition-all active:scale-[0.98] flex items-center justify-center gap-3
                       disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? (
              <>
                <SpinnerIcon size="w-5 h-5" />
                <span className="animate-pulse uppercase text-[12px] tracking-widest">Verifying...</span>
              </>
            ) : isLocked ? (
              <span className="uppercase text-[12px] tracking-widest">Locked ({formattedTime})</span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <footer className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">Need an account or device?</p>
          <div className="flex flex-col gap-2 mt-3">
            <Link to="/get-device" className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:text-blue-700">
              How to Get a Device
            </Link>
            <a href="mailto:admin@smartaqua.com" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600">
              Contact System Admin
            </a>
          </div>
        </footer>
      </div>

      <ForgotPasswordModal 
        isOpen={isForgotModalOpen} 
        onClose={() => setIsForgotModalOpen(false)} 
      />
    </div>
  );
};
const MemoizedLoginForm = memo(LoginForm);
export default MemoizedLoginForm;
