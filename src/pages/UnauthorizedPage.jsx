import { ShieldAlert, ArrowLeft, Home, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { memo } from "react";

export const UnauthorizedPage = memo(() => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
      {/* Decorative Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-lg w-full text-center relative z-10">
        {/* Animated Icon Section */}
        <div className="relative inline-flex mb-8">
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative p-6 bg-slate-900 border border-red-500/30 rounded-3xl shadow-2xl shadow-red-900/20">
            <div className="relative">
              <ShieldAlert className="w-16 h-16 text-red-500" />
              <Lock className="w-6 h-6 text-white absolute -bottom-1 -right-1 bg-red-600 rounded-md p-1 shadow-lg" />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
            Access <span className="text-red-500">Restricted</span>
          </h1>
          <div className="h-1 w-20 bg-red-500/50 mx-auto rounded-full" />
          <p className="text-slate-400 text-base max-w-sm mx-auto leading-relaxed pt-2">
            Ang iyong account level ay walang sapat na access para sa section na ito ng 
            <span className="text-blue-400 font-bold ml-1">SmartAqua</span>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-slate-700 hover:border-slate-600 active:scale-95"
          >
            <ArrowLeft size={18} />
            Bumalik sa Dati:)
          </button>

          <button 
            onClick={() => navigate("/dashboard")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/30 transition-all active:scale-95"
          >
            <Home size={18} />
            Main Dashboard
          </button>
        </div>

        {/* Footer Note */}
        <p className="mt-12 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
          Rose Team • Secure Access Protocol 403
        </p>
      </div>
    </div>
  );
});

UnauthorizedPage.displayName = "UnauthorizedPage";