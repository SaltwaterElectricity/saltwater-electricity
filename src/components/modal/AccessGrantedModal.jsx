import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { RefreshCw } from "lucide-react";
import confetti from "canvas-confetti";

const AccessGrantedModal = ({ isOpen, userData, onFinished }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Confetti effect on mount
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#003d9b", "#00c1fd", "#42fdd3"],
      });

      const duration = 2500; // 2.5 seconds
      const interval = 30; // 30ms updates
      const increment = 100 / (duration / interval);

      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setTimeout(onFinished, 500); // Small delay after 100%
            return 100;
          }
          return prev + increment;
        });
      }, interval);

      return () => clearInterval(timer);
    }
  }, [isOpen, onFinished]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="max-w-[480px] w-full glass-panel rounded-[20px] p-10 shadow-[0_40px_80px_rgba(0,82,204,0.12)] flex flex-col items-center text-center animate-zoomIn">
        {/* User Identity Header (Replacing Checkmark) */}
        <div className="relative mb-8 flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            {/* Profile Avatar */}
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-tertiary-fixed shadow-[0_0_40px_rgba(66,253,211,0.3)] relative z-10 flex items-center justify-center bg-primary/10">
              {userData?.photoURL ? (
                <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary text-[32px] font-bold">
                  {userData?.email?.charAt(0).toUpperCase() || "U"}
                </span>
              )}
            </div>

            {/* Subtle Orbiting Ring - Correctly Aligned */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[108px] h-[108px] border-2 border-dashed border-tertiary-fixed/40 rounded-full animate-[spin_12s_linear_infinite] pointer-events-none" />
          </div>

          {/* Floating Role Badge */}
          <div className="mt-6 px-4 py-1.5 bg-tertiary-fixed/20 text-tertiary font-bold text-[10px] uppercase tracking-[0.2em] rounded-full border border-tertiary-fixed/30 shadow-sm backdrop-blur-md">
            {userData?.role || "Resident"}
          </div>
        </div>

        {/* Impactful Status Text */}
        <h1 className="font-display text-[40px] font-black leading-tight ocean-gradient-text uppercase tracking-tighter mb-2">
          Access Granted
        </h1>
        <p className="font-body-md text-on-surface-variant mb-12 max-w-[340px] leading-relaxed">
          Identity verified. Synchronizing your environment with the regional grid control nodes.
        </p>

        {/* Progress Redirect Section */}
        <div className="w-full space-y-4 mb-4">
          <div className="flex justify-between items-center text-label-sm font-bold tracking-widest uppercase text-[10px]">
            <span className="text-on-surface-variant flex items-center gap-2">
              <RefreshCw size={14} className="animate-spin text-primary" />
              Establishing Secure Tunnel...
            </span>
            <span className="text-primary">{Math.round(progress)}%</span>
          </div>
          {/* Progress Bar Container */}
          <div className="h-2.5 w-full bg-surface-container-highest rounded-full overflow-hidden p-[2px] border border-white/40 shadow-inner">
            <div
              className="h-full progress-shimmer rounded-full glow-line transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer Meta */}
        <div className="mt-12 pt-8 border-t border-outline-variant/20 w-full">
          <div className="flex justify-center gap-8">
            <div className="flex flex-col items-center">
              <span className="text-label-sm font-label-sm text-outline uppercase tracking-tighter text-[10px]">
                Tier
              </span>
              <span className="text-body-md font-semibold text-primary text-sm uppercase">
                {userData?.role || "Resident"}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-label-sm font-label-sm text-outline uppercase tracking-tighter text-[10px]">
                Facility
              </span>
              <span className="text-body-md font-semibold text-primary text-sm">SAN ANDRES</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-label-sm font-label-sm text-outline uppercase tracking-tighter text-[10px]">
                Integrity
              </span>
              <span className="text-body-md font-semibold text-tertiary text-sm uppercase">
                {userData?.status || "Active"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

AccessGrantedModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  userData: PropTypes.object,
  onFinished: PropTypes.func.isRequired,
};

export default AccessGrantedModal;
