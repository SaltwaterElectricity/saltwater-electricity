import { memo } from "react";
import { X } from "lucide-react";
import LoginForm from "../auth/LoginForm";

const LoginModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-[92%] sm:w-full max-w-[480px] glass-panel bg-white shadow-[0_8px_32px_0_rgba(0,82,204,0.08)] rounded-[40px] overflow-hidden flex flex-col max-h-[95vh]">
        <div className="p-8 pb-0 flex justify-between items-start">
          <div>
            <h2 className="text-[32px] font-['Space_Grotesk'] font-bold text-slate-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-[10px] font-['Inter'] font-bold text-slate-400 uppercase tracking-widest mt-1">
              SALTWATER ELECTRICITY MONITORING SYSTEM
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-8 pb-8 overflow-y-auto">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default memo(LoginModal);
