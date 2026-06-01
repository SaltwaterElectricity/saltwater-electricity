import { useState, useEffect, memo } from "react";
import { X } from "lucide-react";
import RequestOTPStep from "../auth/RequestOTPStep";
import VerifyOTPStep from "../auth/VerifyOTPStep";
import ResetPassword from "../auth/ResetPassword";
import ModalBackdrop from "./ModalBackdrop";

/**
 * ORGANISM: ForgotPasswordModal
 * Orchestrates the 3-step recovery flow: Request -> Verify -> Reset.
 * Standardized on 8pt grid with backdrop-blur and in-memory security.
 */
const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  // LOGIC: Reset state when component unmounts
  useEffect(() => {
    return () => {
      setStep(1);
      setEmail("");
      setOtp("");
      setIsVerified(false);
    };
  }, []);

  if (!isOpen) return null;

  /**
   * SECURITY HANDSHAKE:
   * Moves to Reset step only after a successful DB transaction.
   */
  const handleVerifySuccess = (verifiedEmail, verifiedOtp) => {
    setEmail(verifiedEmail);
    setOtp(verifiedOtp);
    setIsVerified(true);
    setStep(3);
  };

  /**
   * FLOW CLEANUP:
   * Called after successful reset to return user to the Login screen.
   */
  const handleFinalSuccess = () => {
    // 2-second buffer is handled inside ResetPasswordStep for the animation
    onClose();
  };

  return (
    <ModalBackdrop>
      <div className="relative w-full max-w-[400px] bg-white rounded-[32px] shadow-2xl border border-primary/10 overflow-hidden animate-in fade-in duration-500 flex flex-col">
        {/* CLOSE BUTTON (Header Level) */}
        <div className="absolute top-6 right-6 z-[60]">
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition-all duration-200"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="p-8 pt-10 flex-1">
          <div className="w-full h-full">
            {step === 1 && (
              <RequestOTPStep
                onNext={(sanitizedEmail) => {
                  setEmail(sanitizedEmail);
                  setStep(2);
                }}
                onClose={onClose}
              />
            )}

            {/* STEP 2: Verify 6-Digit Code */}
            {step === 2 && (
              <VerifyOTPStep
                email={email}
                onSuccess={handleVerifySuccess}
                onBack={() => setStep(1)}
                onClose={onClose}
              />
            )}

            {/* STEP 3: Create New Password (Guarded by isVerified) */}
            {step === 3 && isVerified && (
              <ResetPassword
                email={email}
                otp={otp}
                onSuccess={handleFinalSuccess}
                onClose={onClose}
              />
            )}
          </div>
        </div>

        {/* STEP INDICATOR (Pinned to Bottom) */}
        <div className="px-8 pb-8 pt-2">
          <div className="flex gap-2 justify-center">
            <div
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                step >= 1 ? "bg-primary shadow-[0_0_8px_rgba(10,46,255,0.3)]" : "bg-slate-100"
              }`}
            />
            <div
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                step >= 2 ? "bg-primary shadow-[0_0_8px_rgba(10,46,255,0.3)]" : "bg-slate-100"
              }`}
            />
            <div
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                step >= 3 ? "bg-primary shadow-[0_0_8px_rgba(10,46,255,0.3)]" : "bg-slate-100"
              }`}
            />
          </div>
          <div className="mt-3 flex justify-between px-1">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${step === 1 ? 'text-primary' : 'text-slate-300'}`}>Request</span>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${step === 2 ? 'text-primary' : 'text-slate-300'}`}>Verify</span>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${step === 3 ? 'text-primary' : 'text-slate-300'}`}>Reset</span>
          </div>
        </div>
      </div>
    </ModalBackdrop>
  );
};
const MemoizedForgotPasswordModal = memo(ForgotPasswordModal);
export default MemoizedForgotPasswordModal;
