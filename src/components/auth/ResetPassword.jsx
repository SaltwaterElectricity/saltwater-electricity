import { useState, memo, useMemo } from "react";
import { useForm } from "react-hook-form";
import { resetUserPasswordWithOTP } from "../../services/auth.service";
import { cn } from "../../utils/cn";
import ChecklistItem from "./ChecklistItem";
import ResetSuccessView from "./ResetSuccessView";

/**
 * COMPONENT: ResetPassword
 * Mirrored from code1.html with React state and Firebase logic.
 */
const ResetPassword = ({ email, otp, onSuccess, _onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [success, setSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [redirectPercent, setRedirectPercent] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const newPassword = watch("newPassword", "");

  // Strength Logic from code1.html (25% increments)
  const checks = useMemo(
    () => ({
      length: newPassword.length >= 8,
      upper: /[A-Z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    }),
    [newPassword]
  );

  const strength = useMemo(() => {
    return Object.values(checks).filter(Boolean).length * 25;
  }, [checks]);

  const strengthConfig = useMemo(() => {
    if (strength <= 25) return { label: "Weak", color: "bg-error", text: "text-error" };
    if (strength <= 50) return { label: "Fair", color: "bg-warning", text: "text-warning" };
    if (strength <= 75) return { label: "Strong", color: "bg-primary", text: "text-primary" };
    return { label: "Excellent", color: "bg-success", text: "text-success" };
  }, [strength]);

  const onSubmit = async (data) => {
    if (strength < 100) {
      setError("Security Check: Please satisfy all complexity requirements.");
      setErrorCode("auth/complexity-failed");
      return;
    }

    setLoading(true);
    setError("");
    setErrorCode("");

    try {
      await resetUserPasswordWithOTP(email, data.newPassword, otp);
      setSuccess(true);

      // Start progress simulation for redirect
      let progress = 0;
      const interval = setInterval(() => {
        progress += 2;
        setRedirectPercent(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(onSuccess, 500);
        }
      }, 30);
    } catch (err) {
      setError(err.message || "Failed to update your credentials. Please try again.");
      setErrorCode(err.code || "auth/reset-failed");
      setLoading(false);
    }
  };

  if (success) {
    return <ResetSuccessView redirectPercent={redirectPercent} />;
  }

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in duration-500">
      {/* Security Header */}
      <div className="relative mb-3">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary-container/10 rounded-full animate-pulse" />
          <div className="absolute inset-4 bg-primary-container/20 rounded-full blur-xl" />
          <div className="relative z-10 w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center border border-primary-container/20 security-icon-container">
            <div className="security-icon-inner flex items-center justify-center w-full h-full">
              <img
                alt="Security Lock"
                className="w-10 h-10 object-contain relative z-10"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDf7Rwiehw6b-xmE8kk63oBPY2gHlDF1r0p9zxXPfEGV6nPeZHttomvaqQnZ_wnibNVgMPo8prfDG8SxiKG0GyMufXgbuvYga_m68QcB2jpd8CF-Png9lzoDA_5JOXCu5id1EM6zKuoYBmiJgw1ik6oSBgi-bYfP0CQWL0YsBGImkXS9aORBD09YjVAj9F1R1SPxWa9NQnmyQJjNKKfCgcxQnWL_8n2BY-xgOV6NAw5SNykTXxxw8aLFe2n0VFzr-t3bg22C2CL7UCw"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Typography Header */}
      <div className="text-center mb-3">
        <h1 className="font-headline-lg text-[22px] leading-tight text-on-surface mb-1 tracking-tight font-bold">
          <span className="text-black">Set new</span> <span className="text-primary">Password</span>
        </h1>
        <p className="font-body-md text-on-surface-variant opacity-80 max-w-[360px] mx-auto text-[13px] font-medium leading-relaxed">
          Create a strong password to secure your account.
        </p>
      </div>

      {error && (
        <div className="w-full mb-2 p-2 bg-red-50 border-l-4 border-red-500 text-red-700 text-[10px] font-bold uppercase tracking-wider rounded animate-shake flex flex-col gap-1">
          <span>{error}</span>
          {errorCode === "auth/otp-expired" && (
            <button
              onClick={() => window.location.reload()}
              className="text-[9px] bg-red-600 text-white px-2 py-1 rounded w-fit hover:bg-red-700 transition-colors mt-1"
            >
              Restart Recovery Process
            </button>
          )}
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-1.5">
        {/* New Password Input */}
        <div className="space-y-1.5">
          <div className="relative h-[44px] group">
            <input
              type={showNewPassword ? "text" : "password"}
              {...register("newPassword", { required: true })}
              placeholder="New Password"
              className="w-full h-full px-4 bg-surface-container-low border border-slate-100 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-body-md text-on-surface placeholder:text-outline/50"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showNewPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>

          {/* Strength Meter */}
          <div className="px-2 space-y-1">
            <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-wider">
              <span className={strengthConfig.text}>{strengthConfig.label}</span>
              <span className="text-outline font-mono">{strength}%</span>
            </div>
            <div className="h-1 w-full bg-surface-container rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-500 rounded-full",
                  strengthConfig.color
                )}
                style={{ width: `${strength}%` }}
              />
            </div>
          </div>
        </div>

        {/* Confirm Password Input */}
        <div className="relative h-[44px] group">
          <input
            type={showConfirmPassword ? "text" : "password"}
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (val) => val === newPassword || "Passwords do not match",
            })}
            placeholder="Confirm Password"
            className={cn(
              "w-full h-full px-4 bg-surface-container-low border rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-body-md text-on-surface placeholder:text-outline/50",
              errors.confirmPassword ? "border-error" : "border-slate-100"
            )}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              {showConfirmPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
          {errors.confirmPassword && (
            <span className="text-[9px] text-error font-bold uppercase tracking-widest absolute -bottom-4 left-2">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        {/* Checklist Grid */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 pt-3 border-t border-slate-50">
          <ChecklistItem label="8+ Characters" isValid={checks.length} />
          <ChecklistItem label="Uppercase Letter" isValid={checks.upper} />
          <ChecklistItem label="Include Number" isValid={checks.number} />
          <ChecklistItem label="Special Symbol" isValid={checks.special} />
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading || strength < 100}
          className="w-full h-[48px] mt-6 bg-primary text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group shadow-lg shadow-primary/20"
        >
          {loading ? (
            <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
          ) : (
            <>
              <span>Update Password</span>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </>
          )}
        </button>
      </form>

      {/* Footer Help */}
      <div className="mt-3 text-center">
        <p className="font-label-md text-outline text-[11px] font-medium">
          Having trouble?{" "}
          <a className="text-primary font-bold hover:underline" href="#">
            Contact System Admin
          </a>
        </p>
      </div>
    </div>
  );
};

const MemoizedResetPassword = memo(ResetPassword);
export default MemoizedResetPassword;

