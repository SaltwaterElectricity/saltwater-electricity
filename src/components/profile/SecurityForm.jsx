import { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, CheckCircle2, Shield, History, RotateCcw, Check } from "lucide-react";
import MemoizedToast from "../../components/ui/Toast";
import MemoizedSpinnerIcon from "../../components/ui/SpinnerIcon";
import { StrengthMeter } from "../password-change";

import { calculatePasswordStrength } from "../../utils/passwordMetrics";
import { changeUserPassword, AUTH_ERROR_MESSAGES } from "../../services/auth.service";
import { cn } from "../../utils/cn";

export const SecurityForm = ({ onSaveSuccess }) => {
  // 🧭 Step Tracker: Binabasa natin sa sessionStorage kung verified na siya
  const [isVerified, setIsVerified] = useState(() => {
    return sessionStorage.getItem("is_profile_verified") === "true";
  });

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState(0);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "success" });

  const triggerToast = (message, type = "success") => {
    setToast({ isOpen: true, message, type });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    setStrength(calculatePasswordStrength(formData.newPassword));
  }, [formData.newPassword]);

  // 🔐 STEP 1 handler: Temporarily saves current password to proceed to next UI
  const handleVerification = (e) => {
    e.preventDefault();

    if (!formData.currentPassword) {
      triggerToast("Please enter your current password.", "error");
      return;
    }

    sessionStorage.setItem("is_profile_verified", "true");
    setIsVerified(true);
    triggerToast("Identity checked. Please set your new password.", "success");
  };

  // 💾 STEP 2 handler: Calls your backend service to verify AND update at the same time
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (strength < 80) {
      triggerToast("Password does not meet security requirements.", "error");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      triggerToast("New passwords do not match.", "error");
      return;
    }

    setLoading(true);

    try {
      await changeUserPassword(formData.newPassword, {
        currentPassword: formData.currentPassword,
        isForceReset: false,
      });

      triggerToast("Security credentials updated successfully!", "success");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });

      sessionStorage.removeItem("is_profile_verified");
      setIsVerified(false);

      if (onSaveSuccess) setTimeout(onSaveSuccess, 1500);
    } catch (error) {
      const mappedMessage =
        AUTH_ERROR_MESSAGES[error.code] || error.message || "Failed to update password.";

      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        sessionStorage.removeItem("is_profile_verified");
        setIsVerified(false);
      }

      triggerToast(mappedMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    sessionStorage.removeItem("is_profile_verified");
    setIsVerified(false);
    setFormData((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
  };

  return (
    <>
      <MemoizedToast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />

      <div className="z-20 space-y-5 px-6 pb-8 animate-in fade-in duration-500">
        {/* Security Overview Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mt-6 mx-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* Circular Progress Ring */}
              <div className="relative w-20 h-24 flex items-center justify-center">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#eff4ff"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#004ac6"
                    strokeDasharray="95, 100"
                    strokeWidth="3"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-[#004ac6]">95%</span>
                </div>
              </div>
              {/* Status Info */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-display text-base font-bold text-[#0b1c30]">
                    Security Score
                  </h3>
                  <div className="bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    <span className="text-emerald-600 font-bold text-[9px] uppercase">
                      Protected
                    </span>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <History size={14} />
                    <p className="text-[12px] font-medium">Last updated: 12 days ago</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Shield size={14} className="text-emerald-600" />
                    <p className="text-[12px] font-medium">
                      2FA: <span className="font-bold text-slate-700">Enabled</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Action Button */}
            <button className="bg-primary/5 text-primary font-bold py-2.5 px-6 rounded-xl hover:bg-primary/10 transition-all text-[12px]">
              Audit Logs
            </button>
          </div>
        </div>

        {/* Progress Step Indicator */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mx-6">
          <div className="flex items-center justify-between max-w-lg mx-auto relative px-8">
            {/* Connector Line */}
            <div className="absolute top-4 left-8 right-8 h-0.5 bg-slate-100 -z-0" />
            <div
              className={cn(
                "absolute top-4 left-8 h-0.5 bg-primary -z-0 transition-all duration-500",
                isVerified ? "w-[calc(100%-64px)]" : "w-0"
              )}
            />

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                  isVerified
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-primary text-white"
                )}
              >
                {isVerified ? <Check size={16} /> : <span className="text-xs font-bold">1</span>}
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-tight",
                  isVerified ? "text-primary" : "text-slate-400"
                )}
              >
                Verification
              </span>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  isVerified
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                    : "bg-white border-slate-200 text-slate-400"
                )}
              >
                <span className="text-xs font-bold">2</span>
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-tight",
                  isVerified ? "text-primary" : "text-slate-400"
                )}
              >
                New Password
              </span>
            </div>
          </div>
        </div>

        {/* Password Update Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mx-6">
          <div className="mb-6">
            <h3 className="font-display text-lg font-bold text-[#0b1c30]">
              Update <span className="text-primary">Password</span>
            </h3>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Ensure your account stays secure by using a strong, unique password.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {!isVerified ? (
              <form
                onSubmit={handleVerification}
                className="space-y-5 animate-in slide-in-from-right-4 duration-300"
              >
                <Input
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  placeholder="Enter current password"
                  icon={Lock}
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                />
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || !formData.currentPassword}
                    className="w-full bg-primary text-white font-black py-3.5 px-8 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all text-[12px] uppercase tracking-widest disabled:opacity-50"
                  >
                    Verify & Proceed
                  </button>
                </div>
              </form>
            ) : (
              <form
                onSubmit={handlePasswordUpdate}
                className="space-y-5 animate-in slide-in-from-right-4 duration-300"
              >
                <div className="space-y-1">
                  <label className="font-bold text-[10px] uppercase tracking-wider text-slate-400">
                    New Password
                  </label>
                  <div className="relative">
                    <RotateCcw
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary pointer-events-none"
                    />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      placeholder="Minimum 12 characters"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border-slate-200 rounded-xl pl-10 pr-10 py-3 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-[13px] outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="pt-1.5">
                    <StrengthMeter strength={strength} />
                  </div>
                </div>

                <Input
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Repeat new password"
                  icon={Shield}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />

                <div className="pt-2 flex gap-2.5">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 bg-slate-50 text-slate-500 font-black py-3 px-4 rounded-xl border border-slate-100 hover:bg-slate-100 transition-all text-[12px] uppercase tracking-widest"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={
                      loading || strength < 80 || formData.newPassword !== formData.confirmPassword
                    }
                    className="flex-[2] bg-primary text-white font-black py-3.5 px-10 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all text-[12px] uppercase tracking-widest disabled:opacity-50"
                  >
                    {loading ? (
                      <MemoizedSpinnerIcon size="w-4 h-4" color="text-white" />
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </div>
              </form>
            )}

            <div className="bg-slate-50/50 rounded-xl p-5 border border-slate-100 h-fit">
              <h4 className="text-[10px] font-bold text-[#0b1c30] mb-3.5 uppercase tracking-wider">
                Password Requirements
              </h4>
              <ul className="space-y-3">
                <RequirementItem
                  text="At least 12 characters long"
                  met={formData.newPassword.length >= 12}
                />
                <RequirementItem
                  text="Includes uppercase & lowercase"
                  met={/[a-z]/.test(formData.newPassword) && /[A-Z]/.test(formData.newPassword)}
                />
                <RequirementItem
                  text="Includes at least one number"
                  met={/\d/.test(formData.newPassword)}
                />
                <RequirementItem
                  text="Includes a special character"
                  met={/[^A-Za-z0-9]/.test(formData.newPassword)}
                />
              </ul>
              <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <div className="flex items-start gap-2">
                  <RotateCcw size={14} className="text-primary mt-0.5 shrink-0" />
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    <span className="font-bold text-primary">Tip:</span> Use a passphrase of 4-5
                    random words for better security.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Input = ({ label, type = "text", icon: Icon, ...props }) => {
  const [isVisible, setIsVisible] = useState(false);
  const isPasswordType = type === "password";

  return (
    <div className="space-y-1.5 min-w-0">
      <label className="font-bold text-[11px] uppercase tracking-wider text-slate-400">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none"
          />
        )}
        <input
          type={isPasswordType && isVisible ? "text" : type}
          className={cn(
            "w-full bg-slate-50 border-slate-200 rounded-xl py-3.5 px-4 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-[14px] outline-none disabled:bg-slate-100/50",
            Icon && "pl-11",
            isPasswordType && "pr-12"
          )}
          {...props}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

const RequirementItem = ({ text, met }) => (
  <li
    className={cn(
      "flex items-center gap-3 text-[13px] font-medium transition-colors",
      met ? "text-emerald-600" : "text-slate-400"
    )}
  >
    {met ? (
      <CheckCircle2 size={18} className="text-emerald-500" />
    ) : (
      <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-200 flex-shrink-0" />
    )}
    {text}
  </li>
);
