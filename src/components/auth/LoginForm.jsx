import { useState, memo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { loginUser, getFullUserData } from "../../services/auth.service";
import ForgotPasswordModal from "../modal/ForgotPasswordModal";
import { appError } from "../../utils/appError";
import { useBruteForce } from "../../hooks/useBruteForce";

const LoginForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors } 
  } = useForm({ mode: "onBlur" });

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
        throw new appError("Account not found.", true, "auth/user-not-found");
      }

      if (userData.requiresPasswordChange) {
        navigate("/force-password-change");
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setAuthError(err.message);
      if (err.code !== "auth/user-not-found") {
        await recordFailedAttempt();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Email Field */}
        <div className="relative mb-8">
          <label className="block mb-2 font-bold text-[10px] uppercase tracking-widest text-primary">EMAIL ADDRESS</label>
          <input
            type="email"
            {...register("email", { 
              required: "Email is required",
              pattern: { value: /^\S+@\S+$/i, message: "Invalid format" }
            })}
            placeholder="saltwaterelectricity@gmail.com"
            disabled={isSubmitting || isLocked}
            className={`w-full bg-white border ${errors.email ? 'border-error shadow-sm shadow-error/20' : 'border-outline-variant/30'} rounded-xl py-4 px-5 focus:border-primary transition-all placeholder:text-outline`}
          />
          {errors.email && (
            <span className="absolute -bottom-5 left-0 text-error font-bold text-[10px] uppercase animate-fade-in animate-shake">
              {errors.email.message}
            </span>
          )}
        </div>

        {/* Password Field */}
        <div className="relative mb-8">
          <div className="flex justify-between items-center mb-2">
            <label className="font-bold text-[10px] uppercase tracking-widest text-primary">PASSWORD</label>
            <button 
              type="button" 
              onClick={() => setIsForgotModalOpen(true)}
              className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
            >
              FORGOT?
            </button>
          </div>
          <input
            type="password"
            {...register("password", { required: "Password is required" })}
            placeholder="••••••••"
            disabled={isSubmitting || isLocked}
            className={`w-full bg-white border ${errors.password || isLocked ? 'border-error shadow-sm shadow-error/20' : 'border-outline-variant/30'} rounded-xl py-4 px-5 focus:border-primary transition-all placeholder:text-outline`}
          />
          {errors.password && (
            <span className="absolute -bottom-5 left-0 text-error font-bold text-[10px] uppercase animate-fade-in animate-shake">
              {errors.password.message}
            </span>
          )}
          {isLocked && (
            <span className="absolute -bottom-5 left-0 text-error font-bold text-[10px] uppercase animate-fade-in animate-shake">
              Try again in {formattedTime}
            </span>
          )}
        </div>

        {/* Error Container */}
        {authError && !isLocked && (
          <div className="mb-4 p-2 bg-error-container/20 rounded-xl animate-fade-in">
            <span className="text-error font-bold text-[10px] uppercase tracking-widest">
              {authError}
            </span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isLocked}
          className="w-full ocean-gradient rounded-xl py-4 font-bold uppercase tracking-widest text-[14px] text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              <span>AUTHENTICATING...</span>
            </>
          ) : (
            <>
              <span>LOGIN</span>
              <span className="material-symbols-outlined text-[20px]">login</span>
            </>
          )}
        </button>
      </form>

      <ForgotPasswordModal isOpen={isForgotModalOpen} onClose={() => setIsForgotModalOpen(false)} />
    </>
  );
};

export default memo(LoginForm);
