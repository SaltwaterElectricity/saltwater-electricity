import { useState, useEffect } from "react";
import { Lightbulb, Info } from "lucide-react";
import { updateBulbState } from "../../../services/reading.service";
import { cn } from "../../../utils/cn";
import logger from "../../../utils/logger";

/**
 * DeviceControlSection Component
 * Handles remote manual override for the smart bulb with hydration animations.
 */
export const DeviceControlSection = ({ deviceId, telemetry }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Requirement: Derived state from real-time telemetry
  const isBulbOn = telemetry?.relay_active ?? false;
  const isOnline = telemetry?.timestamp && Date.now() - telemetry.timestamp < 300000;

  const handleToggle = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      await updateBulbState(deviceId, !isBulbOn);
    } catch (error) {
      logger.error("[Panel Control]: Toggle failed:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <section id="section-control" className="scroll-mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h3 className="font-display text-lg font-bold mb-6 text-primary">Device Controls</h3>

      <div
        className={cn(
          "bg-white border rounded-[32px] p-8 transition-all duration-500 shadow-sm hover:shadow-md border-b-2",
          isBulbOn && isMounted ? "border-primary border-b-primary" : "border-slate-100 border-b-slate-200"
        )}
      >
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Bulb Icon with Visual Feedback */}
          <div className="flex flex-col items-center gap-4 w-full">
            <div
              className={cn(
                "w-16 h-16 flex items-center justify-center rounded-[24px] transition-all duration-700 ease-out",
                isBulbOn && isMounted 
                  ? "bg-orange-100 shadow-[0_0_30px_rgba(249,115,22,0.3)] scale-110" 
                  : "bg-slate-50 opacity-50"
              )}
            >
              <Lightbulb
                size={32}
                className={cn(
                  "transition-all duration-700",
                  isBulbOn && isMounted ? "text-orange-500 fill-orange-500/20" : "text-slate-300"
                )}
              />
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-slate-900 text-lg tracking-tight">Smart Bulb Power</p>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-full border border-slate-100">
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-1000",
                      isOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse" : "bg-slate-300"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[9px] font-black uppercase tracking-widest",
                      isOnline ? "text-emerald-600" : "text-slate-400"
                    )}
                  >
                    {isOnline ? "Live" : "Offline"}
                  </span>
                </div>
              </div>
              <p className="text-[13px] text-slate-400 font-medium leading-relaxed">
                Remote manual override for hardware relay
              </p>
            </div>
          </div>

          {/* iOS-Style Toggle Switch */}
          <div className="relative flex items-center justify-center pt-2">
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                System Off
              </span>
              <button
                onClick={handleToggle}
                disabled={isUpdating || !isOnline}
                className={cn(
                  "relative inline-flex h-9 w-18 items-center rounded-full transition-all duration-500 ease-in-out focus:outline-none shadow-inner",
                  isBulbOn && isMounted ? "bg-primary shadow-primary/20" : "bg-slate-100",
                  (isUpdating || !isOnline) && "opacity-50 cursor-not-allowed grayscale"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-7 w-7 transform rounded-full bg-white transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-xl border border-slate-100 flex items-center justify-center",
                    isBulbOn && isMounted ? "translate-x-10" : "translate-x-1"
                  )}
                >
                  {isUpdating ? (
                    <div className="w-3 h-3 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  ) : (
                    <div className={cn("w-1 h-1 rounded-full", isBulbOn && isMounted ? "bg-primary" : "bg-slate-200")} />
                  )}
                </span>
              </button>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest transition-colors duration-500",
                isBulbOn && isMounted ? "text-primary" : "text-slate-300"
              )}>
                Active On
              </span>
            </div>
          </div>

          {!isOnline && (
            <div className="flex items-center gap-2 text-[9px] font-black text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100 animate-in fade-in zoom-in duration-500">
              <Info size={14} className="shrink-0" />
              <span>HARDWARE SYNC REQUIRED • CHECK NODE CONNECTION</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
