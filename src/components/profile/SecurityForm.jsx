import { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react"; 
import MemoizedToast from "../../components/ui/Toast";
import MemoizedSpinnerIcon from "../../components/ui/SpinnerIcon"; 
import { StrengthMeter, PasswordChecklist } from "../password-change";
 
import { calculatePasswordStrength } from "../../utils/passwordMetrics"; 
import { changeUserPassword, AUTH_ERROR_MESSAGES } from "../../services/auth.service"; 

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

    // Pansamantalang itatago sa UI state. Ang mismong changeUserPassword service na ang mag-ve-verify nito mamaya!
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
      // 🚀 Dito tatawagin ang service mo. Isasabay nito ang Re-Auth at Pag-update!
      await changeUserPassword(formData.newPassword, formData.currentPassword, false);

      triggerToast("Security credentials updated successfully!", "success");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      
      sessionStorage.removeItem("is_profile_verified");
      setIsVerified(false); 

      if (onSaveSuccess) setTimeout(onSaveSuccess, 1500);
    } catch (error) {
      // 🔍 Mapananatili nito ang mapping ng AUTH_ERROR_MESSAGES mo
      const mappedMessage = AUTH_ERROR_MESSAGES[error.code] || error.message || "Failed to update password.";
      
      // 🛡️ Kung mali ang current password, ibalik siya sa Step 1
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

      <div className="space-y-6 animate-in fade-in duration-300">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${isVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
              {isVerified ? <CheckCircle2 size={16} /> : <Lock size={16} />}
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                {isVerified ? "Set New Password" : "Identity Verification"}
              </h3>
              <p className="text-[10px] font-bold text-slate-400">
                {isVerified ? "Create a strong and unique security credential" : "Confirm ownership of this Smart Aqua account"}
              </p>
            </div>
          </div>
          
          <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
            Step {isVerified ? "2 / 2" : "1 / 2"}
          </span>
        </div>

        {!isVerified && (
          <form onSubmit={handleVerification} className="space-y-4 max-w-md animate-in slide-in-from-right-4 duration-300">
            <Input 
              label="Current Password" 
              name="currentPassword" 
              type="password" 
              placeholder="••••••••" 
              value={formData.currentPassword} 
              onChange={handleChange} 
              required 
            />

            <div className="flex justify-end pt-2">
              <button 
                type="submit" 
                disabled={loading || !formData.currentPassword}
                className="px-5 py-3 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Verify & Proceed
              </button>
            </div>
          </form>
        )}

        {isVerified && (
          <form onSubmit={handlePasswordUpdate} className="space-y-5 max-w-md animate-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">New Password</label>
              <div className="relative flex items-center">
                <input 
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  placeholder="••••••••"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full p-3 pr-12 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              <div className="flex flex-col gap-3 mt-3">
                <StrengthMeter strength={strength} />
                <PasswordChecklist password={formData.newPassword} />
              </div>
            </div>

            <Input 
              label="Confirm New Password" 
              name="confirmPassword" 
              type="password" 
              placeholder="••••••••" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              required 
            />

            <div className="flex justify-end gap-2 pt-2">
              <button 
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-3 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all active:scale-95"
              >
                Back
              </button>
              <button 
                type="submit" 
                disabled={loading || strength < 80 || formData.newPassword !== formData.confirmPassword}
                className="px-5 py-3 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <MemoizedSpinnerIcon size="w-4 h-4" color="text-white" /> : "Save New Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

const Input = ({ label, type = "text", ...props }) => {
  const [isVisible, setIsVisible] = useState(false);
  const isPasswordType = type === "password";

  return (
    <div className="flex flex-col space-y-1">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">{label}</label>
      <div className="relative flex items-center">
        <input 
          type={isPasswordType && isVisible ? "text" : type} 
          className="w-full p-3 pr-12 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-60" 
          {...props} 
        />
        {isPasswordType && (
          <button 
            type="button" 
            onClick={() => setIsVisible(!isVisible)}
            className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
};