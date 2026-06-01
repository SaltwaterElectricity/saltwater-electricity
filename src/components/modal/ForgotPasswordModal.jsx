import { useState, useEffect, memo } from "react";
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
      <div className="relative w-full max-w-[400px] bg-white rounded-[24px] shadow-2xl border border-primary/20 overflow-hidden animate-in fade-in duration-500">
        {/* STEP INDICATOR */}
        <div className="w-full h-1 bg-slate-50 overflow-hidden">
          <div
            className={`h-full bg-primary transition-all duration-700 ease-in-out ${
              step === 1 ? "w-1/3" : step === 2 ? "w-2/3" : "w-full"
            }`}
          />
        </div>

        <div className="p-7 flex flex-col gap-4">
          {/* STEP 1: Request Email */}
          <div className="flex flex-col">
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
              />
            )}

            {/* STEP 3: Create New Password (Guarded by isVerified) */}
            {step === 3 && isVerified && (
              <ResetPassword email={email} otp={otp} onSuccess={handleFinalSuccess} />
            )}
          </div>
        </div>
      </div>
    </ModalBackdrop>
  );
};
const MemoizedForgotPasswordModal = memo(ForgotPasswordModal);
export default MemoizedForgotPasswordModal;
