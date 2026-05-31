import { useState, memo, useRef, useEffect } from "react";
import { Shield, Mail, Lock, ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react";
import { verifyResetOTP } from "../../services/otp.service";
import { cn } from "../../utils/cn";

/**
 * COMPONENT: VerifyOTPStep
 * Mirrored from code1.html with React state and Firebase logic.
 */
const VerifyOTPStep = ({ email, onSuccess, onBack }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);

  // LOGIC: Auto-focus first field on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const getUserId = (emailStr) =>
    emailStr
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "");

  const handleInputChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next field
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pasteData)) return;

    const newOtp = [...otp];
    pasteData.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);

    // Focus the last filled input or the next one
    const nextIndex = Math.min(pasteData.length, 5);
    inputRefs.current[nextIndex].focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userId = getUserId(email);
      const result = await verifyResetOTP(userId, otpCode, false);

      if (result.verified) {
        onSuccess(result.email, otpCode);
      }
    } catch (err) {
      const safeMsg = err.message || "Security verification failed. Please try again.";
      setError(safeMsg);

      if (safeMsg.includes("lockout") || safeMsg.includes("expired")) {
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0].focus();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full animate-in fade-in duration-500">
      {/* Header Section */}
      <header className="flex flex-col items-center mb-8 w-full">
        {/* Shield Icon Container */}
        <div className="mb-4 relative">
          <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center border-white shadow-sm overflow-hidden border border-slate-100">
            <img
              alt="Security Icon"
              className="w-16 h-16 object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuZ532yggmZ9mYAHHjWF30DB_QcCJVZigzpZkq8jRX56Fyhn6IVZFfTyV-nbkChgja-c8oGgyZO3yI8LZFtN4AMHeT3X3omoEVVPMvdR8ib4aQgWxsmdyhgjswXlndO8wpbpvlrdEbtektPMZNdYgWeRZL_Jrapi_ljf14ea7dpLJj5gVeWxQmqmv1A8acM1qa1yYnsaHPJmnEpjCgnGIQI7PG3FGyZHi21N5SfhzYkLXJU3LGOKAA9YjF1z79HqgQXYV2ojs7_jST"
            />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Verify <span className="text-primary">Identity</span>
        </h1>
        <p className="text-slate-500 text-center text-sm font-medium px-4">
          Enter the 6-digit code sent to your email
        </p>

        {/* Email Pill */}
        <div className="mt-4 flex items-center bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
          <Mail className="h-4 w-4 text-primary mr-2" />
          <span className="text-slate-800 text-sm font-semibold tracking-tight">{email}</span>
        </div>
      </header>

      {/* Form Section */}
      <form onSubmit={handleVerify} className="w-full">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center mb-6 justify-center animate-shake">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 shrink-0" />
            <p className="text-red-700 text-xs font-medium text-center">{error}</p>
          </div>
        )}

        {/* OTP Input Area */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-8" onPaste={handlePaste}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <input
              key={`otp-field-${index}`} 
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={otp[index]}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={cn(
                "w-10 h-14 sm:w-[52px] sm:h-[64px] flex items-center justify-center text-2xl font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl text-center outline-none transition-all",
                "focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10",
                "animate-fadeInUp opacity-0",
                `otp-delay-${index + 1}`
              )}
              placeholder="•"
            />
          ))}
        </div>

        {/* Helper Text */}
        <div className="flex items-center justify-center mb-8 gap-2">
          <Shield className="h-4 w-4 text-primary/60" />
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
            Check your inbox and spam folder
          </span>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading || otp.join("").length < 6}
          className="w-full primary-gradient py-4 rounded-2xl flex items-center justify-center gap-3 text-white font-bold transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
        >
          <div className="bg-white/20 p-1.5 rounded-full shrink-0">
            {loading ? (
              <div className="loader-spinner" />
            ) : (
              <Lock className="h-5 w-5" />
            )}
          </div>
          <span className="text-lg">
            {loading ? "Verifying..." : "Verify & Continue"}
          </span>
          {!loading && <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />}
        </button>
      </form>

      {/* Footer Action */}
      <footer className="flex flex-col gap-4 mt-6 w-full">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="w-full h-12 border-none bg-transparent flex items-center justify-center gap-2 transition-all hover:bg-slate-50 rounded-xl"
        >
          <ArrowLeft className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Change Email
          </span>
        </button>
      </footer>
    </div>
  );
};

const MemoizedVerifyOTPStep = memo(VerifyOTPStep);
export default MemoizedVerifyOTPStep;
