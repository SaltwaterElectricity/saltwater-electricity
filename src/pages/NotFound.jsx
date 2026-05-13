import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home } from "lucide-react";
import { logActivity } from "../services/audit.service";
import { ROUTES } from "../constants/routes";

/**
 * NotFound Page
 * High HCI compliance with empathetic, non-technical language.
 * Features automated security audit logging for potential enumeration detection.
 * Aligned with Saltwater Electricity Visual Language.
 */
const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // SECURITY: Log potential enumeration attempts as per Unified Protocol
    const logTrace = async () => {
      try {
        await logActivity(
          "POTENTIAL_ENUMERATION",
          "navigation_failure",
          `User attempted to access non-existent path: ${location.pathname}`
        );
      } catch {
        // Silent fail for logging to ensure UI performance
      }
    };

    logTrace();
  }, [location.pathname]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 md:p-12 antialiased relative animate-in fade-in duration-700 overflow-hidden">
      {/* Decorative Water Background Effects - Restored for Standalone Presence */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute top-[-15%] right-[-10%] w-[70%] h-[70%] bg-secondary-container/40 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[560px] text-center glass-panel p-8 md:p-12 shadow-[0_32px_64px_-12px_rgba(0,101,145,0.15)] flex flex-col gap-10 z-10 relative">
        {/* Branding */}
        <div className="space-y-2">
          <h1 className="text-[72px] md:text-[96px] font-h1 font-black text-primary tracking-tighter uppercase glow-line leading-none opacity-80">
            404
          </h1>
          <div className="h-1.5 w-24 ocean-gradient mx-auto rounded-full opacity-50" />
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h2 className="text-[28px] md:text-[32px] font-h2 font-bold text-on-surface uppercase tracking-tight">
            Navigation Error
          </h2>
          <p className="font-body-md text-body-lg text-on-surface-variant leading-relaxed max-w-md mx-auto">
            It looks like this path has drifted away. Let&apos;s get you back to familiar waters.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <button
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="w-full flex items-center justify-center gap-3 px-8 py-5 ocean-gradient text-white rounded-[24px] font-black text-body-md uppercase tracking-[0.15em] transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/30"
          >
            <Home size={20} />
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
