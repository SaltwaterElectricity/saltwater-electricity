import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Waves, Home, ArrowLeft } from 'lucide-react';
import { logActivity } from '../services/audit.service';
import { ROUTES } from '../constants/routes';

/**
 * NotFound Page
 * High HCI compliance with empathetic, non-technical language.
 * Features automated security audit logging for potential enumeration detection.
 */
const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // SECURITY: Log potential enumeration attempts as per Unified Protocol
    const logTrace = async () => {
      try {
        await logActivity(
          'POTENTIAL_ENUMERATION',
          'navigation_failure',
          `User attempted to access non-existent path: ${location.pathname}`
        );
      } catch (_error) {
        // Silent fail for logging to ensure UI performance
      }
    };
    
    logTrace();
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center p-6 antialiased font-sans">
      {/* Decorative Water Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Animated Visual Identity */}
        <div className="inline-flex relative mb-8">
          <div className="absolute inset-0 bg-sky-400/20 rounded-full blur-2xl animate-ping opacity-25" />
          <div className="relative p-8 bg-white border border-sky-100 rounded-[40px] shadow-2xl shadow-sky-900/10">
            <Waves size={64} className="text-sky-500 animate-bounce" style={{ animationDuration: '3s' }} />
          </div>
        </div>

        {/* Empathetic Messaging */}
        <div className="space-y-4">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
            Lost at <span className="text-sky-600">sea?</span>
          </h1>
          <div className="h-1.5 w-24 bg-sky-500/30 mx-auto rounded-full" />
          <p className="text-slate-500 text-lg font-medium leading-relaxed pt-2">
            It looks like the page you were looking for has drifted away. 
            Don't worry, we'll help you find your way back to safe waters.
          </p>
        </div>

        {/* Action Buttons (8pt Grid) */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white hover:bg-sky-50 text-slate-700 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all border-2 border-slate-100 active:scale-95 shadow-sm"
          >
            <ArrowLeft size={18} className="text-sky-500" />
            Go Back
          </button>

          <button 
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-sky-900/20"
          >
            <Home size={18} className="text-sky-400" />
            Return to Dashboard
          </button>
        </div>

        {/* Verification Tag */}
        <p className="mt-16 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
          Saltwater Electricity Security Node • Path 404
        </p>
      </div>
    </div>
  );
};

export default NotFound;
