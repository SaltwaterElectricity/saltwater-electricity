import { useState, memo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Loader2, X } from "lucide-react";
import { loginUser } from "../../services/auth.service";
import { useBruteForce } from "../../hooks/useBruteForce";
import { sanitizeForFirebaseKey } from "../../utils/sanitization";
import { cn } from "../../utils/cn";

// Recovery Components
import RequestOTPStep from "./RequestOTPStep";
import VerifyOTPStep from "./VerifyOTPStep";
import ResetPassword from "./ResetPassword";

/**
 * LoginForm Component
 * Orchestrates Login and Forgot Password flows.
 * Handles user authentication and multi-step recovery.
 */
const LoginForm = ({ onLoginSuccess, onLoginStart, onLoginError }) => {
  const navigate = useNavigate();
  const [view, setView] = useState("login"); // 'login' | 'forgot-request' | 'forgot-verify' | 'forgot-reset'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");

  // Recovery States
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ mode: "onBlur" });

  const emailInput = watch("email");
  const trackingId = emailInput ? sanitizeForFirebaseKey(emailInput) : null;
  const { isLocked, formattedTime, recordFailedAttempt } = useBruteForce(trackingId);

  const onSubmit = async (data) => {
    if (isLocked) return;
    setIsSubmitting(true);
    setAuthError("");

    if (onLoginStart) onLoginStart();

    try {
      const response = await loginUser(data.email, data.password);
      const { userData } = response;

      if (!userData) {
        setAuthError("Account not found.");
        if (onLoginError) onLoginError();
        return;
      }

      if (userData.requiresPasswordChange) {
        navigate("/force-password-change");
        return;
      }

      if (onLoginSuccess) {
        onLoginSuccess({ ...userData, email: data.email });
      }
    } catch (err) {
      setAuthError(err.message);
      if (onLoginError) onLoginError();
      if (err.code !== "auth/user-not-found") {
        await recordFailedAttempt();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = useCallback(() => {
    setView("login");
    setForgotEmail("");
    setForgotOtp("");
    setIsVerified(false);
  }, []);

  const handleVerifySuccess = (verifiedEmail, verifiedOtp) => {
    setForgotEmail(verifiedEmail);
    setForgotOtp(verifiedOtp);
    setIsVerified(true);
    setView("forgot-reset");
  };

  // --- RENDER RECOVERY FLOW ---
  if (view !== "login") {
    const step = view === "forgot-request" ? 1 : view === "forgot-verify" ? 2 : 3;

    return (
      <div className="w-full relative flex flex-col animate-in fade-in duration-500 min-h-[420px]">
        {/* CLOSE BUTTON */}
        <div className="absolute -top-4 -right-2 z-50">
          <button
            onClick={handleBackToLogin}
            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition-all duration-200"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 flex flex-col justify-center py-4">
          {view === "forgot-request" && (
            <RequestOTPStep
              onNext={(email) => {
                setForgotEmail(email);
                setView("forgot-verify");
              }}
              onClose={handleBackToLogin}
            />
          )}

          {view === "forgot-verify" && (
            <VerifyOTPStep
              email={forgotEmail}
              onSuccess={handleVerifySuccess}
              onBack={() => setView("forgot-request")}
            />
          )}

          {view === "forgot-reset" && isVerified && (
            <ResetPassword email={forgotEmail} otp={forgotOtp} onSuccess={handleBackToLogin} />
          )}
        </div>

        {/* STEP INDICATOR (Pinned to Bottom) */}
        <div className="pt-4 mt-auto border-t border-slate-50">
          <div className="flex gap-2 justify-center">
            <div
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                step >= 1 ? "bg-primary shadow-[0_0_8px_rgba(10,46,255,0.3)]" : "bg-slate-100"
              }`}
            />
            <div
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                step >= 2 ? "bg-primary shadow-[0_0_8px_rgba(10,46,255,0.3)]" : "bg-slate-100"
              }`}
            />
            <div
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                step >= 3 ? "bg-primary shadow-[0_0_8px_rgba(10,46,255,0.3)]" : "bg-slate-100"
              }`}
            />
          </div>
          <div className="mt-2 flex justify-between px-1">
            <span
              className={`text-[9px] font-bold uppercase tracking-widest ${step === 1 ? "text-primary" : "text-slate-300"}`}
            >
              Request
            </span>
            <span
              className={`text-[9px] font-bold uppercase tracking-widest ${step === 2 ? "text-primary" : "text-slate-300"}`}
            >
              Verify
            </span>
            <span
              className={`text-[9px] font-bold uppercase tracking-widest ${step === 3 ? "text-primary" : "text-slate-300"}`}
            >
              Reset
            </span>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER LOGIN VIEW ---
  return (
    <div className="w-full">
      {/* Welcome Header */}
      <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-2xl font-bold text-on-surface mb-2 font-display">Welcome Back</h1>
        <p className="text-outline text-xs font-body-md uppercase tracking-wider">
          Saltwater Device Monitoring
        </p>
        <p className="text-outline/60 text-[10px] font-medium mt-1 font-body-md">
          Access your real-time telemetry dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Global Error Container */}
        {authError && !isLocked && (
          <div className="p-2 bg-error/5 border border-error/20 rounded-lg animate-fade-in mb-2">
            <span className="text-error font-bold text-[9px] uppercase tracking-widest flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[12px]">report</span>
              {authError}
            </span>
          </div>
        )}

        {/* Email Field */}
        <div className="pt-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-primary font-body-md pl-1 mb-1">
            Email Address
          </label>
          <div className="relative group mt-5">
            <input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+$/i, message: "Invalid format" },
              })}
              placeholder="name@example.com"
              disabled={isSubmitting || isLocked}
              className={cn(
                "w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl font-body-md text-sm text-on-surface transition-all outline-none",
                "placeholder:text-outline/40",
                "focus:ring-2 focus:ring-primary/10 focus:border-primary",
                errors.email ? "border-error/50 bg-error/5" : "hover:border-outline-variant"
              )}
            />
            {errors.email && (
              <span className="absolute -top-5 left-0 text-error font-bold text-[9px] uppercase tracking-widest animate-fade-in block pl-1">
                {errors.email.message}
              </span>
            )}
          </div>
        </div>

        {/* Password Field */}
        <div className="pt-1">
          <div className="flex justify-between items-center px-1 mb-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-primary font-body-md">
              Password
            </label>
            <button
              type="button"
              onClick={() => setView("forgot-request")}
              className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider font-body-md"
            >
              Forgot?
            </button>
          </div>
          <div className="relative group mt-5">
            <input
              type="password"
              {...register("password", { required: "Password is required" })}
              placeholder="••••••••"
              disabled={isSubmitting || isLocked}
              className={cn(
                "w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl font-body-md text-sm text-on-surface transition-all outline-none",
                "placeholder:text-outline/40",
                "focus:ring-2 focus:ring-primary/10 focus:border-primary",
                errors.password || isLocked
                  ? "border-error/50 bg-error/5"
                  : "hover:border-outline-variant"
              )}
            />
            {errors.password && (
              <span className="absolute -top-5 left-0 text-error font-bold text-[9px] uppercase tracking-widest animate-fade-in block pl-1">
                {errors.password.message}
              </span>
            )}
            {isLocked && (
              <span className="absolute -top-5 left-0 text-error font-bold text-[9px] uppercase tracking-widest animate-fade-in block pl-1">
                Security Lock: {formattedTime}
              </span>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || isLocked}
            className={cn(
              "w-full ocean-gradient text-white py-3 rounded-2xl font-bold tracking-widest text-xs uppercase shadow-xl transition-all flex items-center justify-center gap-2",
              "hover:shadow-primary/30 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale disabled:scale-100"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>LOGIN NOW</span>
                <span className="material-symbols-outlined text-[18px]">login</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Helper Links */}
      <div className="mt-8 text-center space-y-3">
        <p className="text-[10px] text-outline font-body-md uppercase tracking-widest opacity-60">
          New user or missing device?
        </p>
        <div className="flex flex-col gap-2">
          <a
            href="#"
            className="text-[11px] font-bold text-primary tracking-widest hover:underline uppercase font-body-md"
          >
            How to get a device
          </a>
          <a
            href="#"
            className="text-[11px] font-bold text-outline/60 tracking-widest hover:underline uppercase font-body-md"
          >
            Contact Facility Admin
          </a>
        </div>
      </div>
    </div>
  );
};

export default memo(LoginForm);
