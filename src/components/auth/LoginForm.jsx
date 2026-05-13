import { useState, memo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { loginUser } from "../../services/auth.service";
import { ForgotPasswordModal } from "../modal";
import { appError } from "../../utils/appError";
import { useBruteForce } from "../../hooks/useBruteForce";
import { sanitizeForFirebaseKey } from "../../utils/sanitization";
import { cn } from "../../utils/cn";

const LoginForm = ({ onLoginSuccess, onLoginStart, onLoginError }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

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

    // SYNC: Tell parent we are starting login to block any premature redirects
    if (onLoginStart) onLoginStart();

    try {
      const response = await loginUser(data.email, data.password);
      const { userData } = response;

      if (!userData) {
        throw new appError("Account not found.", true, "auth/user-not-found");
      }

      if (userData.requiresPasswordChange) {
        navigate("/force-password-change");
        return;
      }

      // Instead of navigating, pass the data to the parent to trigger the success UI
      if (onLoginSuccess) {
        onLoginSuccess({ ...userData, email: data.email });
      }
    } catch (err) {
      setAuthError(err.message);
      
      // SYNC: Tell parent login failed so it can unblock redirects if needed
      if (onLoginError) onLoginError();

      if (err.code !== "auth/user-not-found") {
        await recordFailedAttempt();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
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
              onClick={() => setIsForgotModalOpen(true)}
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

      <ForgotPasswordModal isOpen={isForgotModalOpen} onClose={() => setIsForgotModalOpen(false)} />
    </div>
  );
};

export default memo(LoginForm);
