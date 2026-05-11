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
    <div className="min-h-[80vh] flex items-center justify-center p-md antialiased">
      {/* Decorative Water Background Effects */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#00c1fd] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#0052cc] rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-[500px] text-center glass-panel p-md shadow-2xl flex flex-col gap-md">
        {/* Branding */}
        <h1 className="text-[48px] font-['Space_Grotesk'] font-semibold text-primary tracking-tighter uppercase glow-line">
          404
        </h1>

        {/* Message */}
        <div className="space-y-sm">
          <h2 className="text-[24px] font-['Space_Grotesk'] font-medium text-on-surface">
            Navigation Error
          </h2>
          <p className="font-['Inter'] text-body-md text-on-surface-variant leading-relaxed">
            It looks like this path has drifted away. Let&apos;s get you back to familiar waters.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => navigate(ROUTES.DASHBOARD)}
          className="w-full flex items-center justify-center gap-sm px-md py-sm ocean-gradient text-white rounded-[20px] font-black text-label-sm uppercase tracking-widest transition-all active:scale-95"
        >
          <Home size={18} />
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFound;
