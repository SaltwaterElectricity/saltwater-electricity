import { memo } from "react";
import { Check, ShieldCheck, Terminal } from "lucide-react";

/**
 * COMPONENT: ResetSuccessView
 * A pixel-perfect mirror of the success state in docs/legacy-designs/code1.html.
 * Features the signature progress ring, dual-tone header, and security encryption card.
 */
const ResetSuccessView = ({ redirectPercent }) => {
  return (
    <div className="w-full flex flex-col items-center text-center animate-in fade-in duration-700">
      {/* 1. Progress Ring Section (Mirrored from code1.html) */}
      <div className="relative w-20 h-20 mb-6">
        <svg className="w-20 h-20 animate-[spin_4s_linear_infinite]" viewBox="0 0 80 80">
          <circle
            className="text-surface-container-high"
            cx="40"
            cy="40"
            fill="transparent"
            r="34"
            stroke="currentColor"
            strokeWidth="6"
          />
          <circle
            className="text-primary"
            cx="40"
            cy="40"
            fill="transparent"
            r="34"
            stroke="currentColor"
            strokeDasharray="213"
            strokeDashoffset="140"
            strokeLinecap="round"
            strokeWidth="6"
          />
        </svg>
        {/* Lock Icon Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(33,112,228,0.4)] animate-pulse">
            <Check className="text-white" size={20} strokeWidth={3} />
          </div>
        </div>
      </div>

      {/* 2. Text Section (Exact phrasing from code1.html) */}
      <div className="mb-6">
        <h1 className="font-headline-md text-[28px] text-on-surface font-bold mb-1 tracking-tight">
          <span className="text-black">Successfully</span>{" "}
          <span className="text-[#2563eb]">Updated!</span>
        </h1>
        <p className="text-green-600 font-medium text-sm leading-relaxed max-w-[280px] mx-auto">
          Your password has been changed successfully.
        </p>
        <p className="text-[#0a2eff] font-medium text-[13px] mt-1">
          You can now sign in with your new credentials.
        </p>
      </div>

      {/* 3. Progress Bar (Exact mirror of code1.html logic) */}
      <div className="w-full mb-8" id="redirect-container">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1.5 text-green-600">
            <Terminal size={16} />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Redirecting to Login Page...
            </span>
          </div>
          <span className="text-on-surface font-bold text-[12px] text-green-600 font-mono">
            {redirectPercent}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 ease-linear bg-green-600"
            style={{ width: `${redirectPercent}%` }}
          />
        </div>
      </div>

      {/* 4. Security Message Card */}
      <div className="w-full bg-surface-container-high/50 rounded-xl p-4 flex items-start gap-3 border border-slate-100">
        <ShieldCheck className="text-primary mt-0.5 shrink-0" size={18} />
        <p className="text-[10px] text-on-surface-variant leading-tight text-left font-medium">
          Your credentials are being encrypted and securely updated using industry-standard AES-256
          protocols.
        </p>
      </div>
    </div>
  );
};

export default memo(ResetSuccessView);
