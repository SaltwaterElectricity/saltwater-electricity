import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, ShieldAlert } from "lucide-react";
import { logoutUser } from "../../services/auth.service";
import { useAuth } from "../../context/useAuth";
import ModalBackdrop from "./ModalBackdrop";
import { cn } from "../../utils/cn";
import { ROUTES } from "../../constants/routes";

/**
 * SessionExpiredModal Component
 * Forced interaction modal shown when security timeout is reached.
 */
const SessionExpiredModal = () => {
  const navigate = useNavigate();
  const { isSessionExpired, setIsSessionExpired } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isSessionExpired) return null;

  const handleAcknowledge = async () => {
    setIsProcessing(true);
    try {
      // 1. Perform secure logout and local cleanup
      await logoutUser();

      // 2. Clear state and redirect
      setIsSessionExpired(false);
      navigate(ROUTES.LOGIN, { replace: true });
    } catch {
      // Fallback for extreme network failure
      setIsSessionExpired(false);
      navigate(ROUTES.LOGIN, { replace: true });
    }
  };

  return (
    <ModalBackdrop>
      <div className="relative w-[90%] max-w-md bg-white rounded-[32px] p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-300">
        {/* ICON HEADER */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center relative">
            <Clock className="text-amber-500 w-10 h-10" />
            <div className="absolute -top-1 -right-1 bg-white p-1 rounded-full shadow-sm">
              <ShieldAlert className="text-amber-600 w-5 h-5" />
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="text-center space-y-3 mb-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
            Session <span className="text-amber-600">Expired</span>
          </h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            For your security, you have been logged out due to inactivity. Please sign in again to
            continue monitoring.
          </p>
        </div>

        {/* ACTION */}
        <button
          onClick={handleAcknowledge}
          disabled={isProcessing}
          className={cn(
            "w-full py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2",
            isProcessing
              ? "bg-slate-100 text-slate-400 cursor-wait"
              : "bg-slate-900 hover:bg-black text-white"
          )}
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              Closing Session...
            </>
          ) : (
            "Understood, take me to Login"
          )}
        </button>

        {/* SECURITY FOOTER */}
        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-6">
          Security Protocol: Local Cache Purged
        </p>
      </div>
    </ModalBackdrop>
  );
};

export default SessionExpiredModal;
