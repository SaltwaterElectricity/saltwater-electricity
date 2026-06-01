import { useState, memo, useMemo } from "react";
import { useForm } from "react-hook-form";
import { CheckCircle2 } from "lucide-react";
import { resetUserPasswordWithOTP } from "../../services/auth.service";
import { cn } from "../../utils/cn";

/**
 * COMPONENT: ResetPassword
 * Mirrored from code1.html with React state and Firebase logic.
 */
const ResetPassword = ({ email, otp, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
      return;
    }

    setLoading(true);
    setError("");

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
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full flex flex-col items-center text-center py-10 animate-in fade-in duration-500">
        <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mb-8">
          <svg
            className="w-12 h-12 text-success"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 24 24"
          >
            <path
              className="success-checkmark"
              d="M5 13l4 4L19 7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="font-headline-lg text-3xl mb-4 text-on-surface font-bold">Password Updated</h2>
        <p className="font-body-md text-on-surface-variant opacity-80 max-w-[360px] mx-auto text-[18px]">
          Your security settings have been updated successfully.
        </p>
        <div className="w-full space-y-3 mt-8">
          <div className="flex justify-between font-label-md text-outline mb-1 text-xs font-bold uppercase tracking-wider">
            <span>Redirecting to Login</span>
            <span>{redirectPercent}%</span>
          </div>
          <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 linear rounded-full"
              style={{ width: `${redirectPercent}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in duration-500">
      {/* Security Header */}
      <div className="relative mb-6">
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary-container/10 rounded-full animate-pulse" />
          <div className="absolute inset-4 bg-primary-container/20 rounded-full blur-xl" />
          <div className="relative z-10 w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center border border-primary-container/20 security-icon-container">
            <div className="security-icon-inner flex items-center justify-center w-full h-full">
              <img
                alt="Security Lock"
                className="w-16 h-16 object-contain relative z-10"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDf7Rwiehw6b-xmE8kk63oBPY2gHlDF1r0p9zxXPfEGV6nPeZHttomvaqQnZ_wnibNVgMPo8prfDG8SxiKG0GyMufXgbuvYga_m68QcB2jpd8CF-Png9lzoDA_5JOXCu5id1EM6zKuoYBmiJgw1ik6oSBgi-bYfP0CQWL0YsBGImkXS9aORBD09YjVAj9F1R1SPxWa9NQnmyQJjNKKfCgcxQnWL_8n2BY-xgOV6NAw5SNykTXxxw8aLFe2n0VFzr-t3bg22C2CL7UCw"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Typography Header */}
      <div className="text-center mb-10">
        <h1 className="font-headline-lg text-[42px] leading-tight text-on-surface mb-3 tracking-tight font-bold">
          <span className="text-black">Set new</span> <span className="text-primary">Password</span>
        </h1>
        <p className="font-body-md text-on-surface-variant opacity-80 max-w-[360px] mx-auto text-sm font-medium leading-relaxed">
          Create a strong password to secure your account.
        </p>
      </div>

      {error && (
        <div className="w-full mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-[10px] font-bold uppercase tracking-wider rounded animate-shake">
          {error}
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
        {/* New Password Input */}
        <div className="space-y-2">
          <div className="relative h-[64px] group">
            <input
              type={showNewPassword ? "text" : "password"}
              {...register("newPassword", { required: true })}
              placeholder="New Password"
              className="w-full h-full px-6 bg-surface-container-low border border-slate-100 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-body-md text-on-surface placeholder:text-outline/50"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">
                {showNewPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>

          {/* Strength Meter */}
          <div className="px-2 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
              <span className={strengthConfig.text}>{strengthConfig.label}</span>
              <span className="text-outline font-mono">{strength}%</span>
            </div>
            <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
              <div
                className={cn("h-full transition-all duration-500 rounded-full", strengthConfig.color)}
                style={{ width: `${strength}%` }}
              />
            </div>
          </div>
        </div>

        {/* Confirm Password Input */}
        <div className="relative h-[64px] group">
          <input
            type={showConfirmPassword ? "text" : "password"}
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (val) => val === newPassword || "Passwords do not match",
            })}
            placeholder="Confirm Password"
            className={cn(
              "w-full h-full px-6 bg-surface-container-low border rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-body-md text-on-surface placeholder:text-outline/50",
              errors.confirmPassword ? "border-error" : "border-slate-100"
            )}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">
              {showConfirmPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
          {errors.confirmPassword && (
            <span className="text-[9px] text-error font-bold uppercase tracking-widest absolute -bottom-5 left-2">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        {/* Checklist Grid */}
        <div className="grid grid-cols-2 gap-y-5 gap-x-8 pt-6 border-t border-slate-50">
          <ChecklistItem label="8+ Characters" isValid={checks.length} />
          <ChecklistItem label="Uppercase Letter" isValid={checks.upper} />
          <ChecklistItem label="Include Number" isValid={checks.number} />
          <ChecklistItem label="Special Symbol" isValid={checks.special} />
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading || strength < 100}
          className="w-full h-[64px] mt-10 bg-primary text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group shadow-lg shadow-primary/20"
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
      <div className="mt-8 text-center">
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

const ChecklistItem = ({ label, isValid }) => (
  <div className={cn("flex items-center gap-2 transition-all", isValid ? "opacity-100" : "opacity-60")}>
    <CheckCircle2
      size={18}
      className={cn("transition-colors", isValid ? "text-success" : "text-slate-200")}
    />
    <span
      className={cn(
        "text-[11px] font-bold tracking-tight transition-colors",
        isValid ? "text-on-surface" : "text-outline"
      )}
    >
      {label}
    </span>
  </div>
);

const MemoizedResetPassword = memo(ResetPassword);
export default MemoizedResetPassword;
