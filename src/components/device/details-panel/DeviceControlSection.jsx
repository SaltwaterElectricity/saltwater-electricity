import { useState } from "react";
import { Lightbulb, Info } from "lucide-react";
import { updateBulbState } from "../../../services/reading.service";
import { cn } from "../../../utils/cn";
import logger from "../../../utils/logger";

/**
 * DeviceControlSection Component
 * Handles remote manual override for the smart bulb.
 */
export const DeviceControlSection = ({ deviceId, telemetry }) => {
  const [isUpdating, setIsUpdating] = useState(false);

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
    <section id="section-control" className="scroll-mt-6">
      <h3 className="font-display text-lg font-bold mb-6 text-primary">Device Controls</h3>

      <div className={cn(
        "bg-white border rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-md",
        isBulbOn ? "border-primary" : "border-slate-100"
      )}>
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Bulb Icon with Visual Feedback */}
          <div className="flex flex-col items-center gap-4 w-full">
            <div className={cn(
              "w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-300",
              isBulbOn 
                ? "bg-orange-100 shadow-[0_0_15px_rgba(249,115,22,0.2)]" 
                : "bg-blue-50/50"
            )}>
              <Lightbulb 
                size={32} 
                className={cn(
                  "transition-colors duration-300",
                  isBulbOn ? "text-orange-500" : "text-primary/40"
                )} 
              />
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-slate-900 text-lg">Smart Bulb Power</p>
                <div className="flex items-center gap-1.5">
                  <div className={cn(
                    "w-2 h-2 rounded-full transition-all shadow-[0_0_8px_rgba(16,185,129,0.4)]",
                    isOnline ? "bg-emerald-500" : "bg-slate-300"
                  )} />
                  <span className={cn(
                    "text-[11px] font-bold uppercase tracking-widest",
                    isOnline ? "text-emerald-500" : "text-slate-400"
                  )}>{isOnline ? "Online" : "Offline"}</span>
                </div>
              </div>
              <p className="text-[14px] text-slate-500 leading-relaxed">Remote toggle for manual override</p>
            </div>
          </div>

          {/* iOS-Style Toggle Switch */}
          <div className="relative flex items-center justify-center pt-2">
            <div className="flex items-center gap-4">
              <span className="text-[12px] font-medium text-slate-400 uppercase tracking-wider">Off</span>
              <button
                onClick={handleToggle}
                disabled={isUpdating || !isOnline}
                className={cn(
                  "relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-500 ease-in-out focus:outline-none",
                  isBulbOn ? "bg-primary shadow-sm" : "bg-slate-100 shadow-inner",
                  (isUpdating || !isOnline) && "opacity-50 cursor-not-allowed"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-6 w-6 transform rounded-full bg-white transition-all duration-500 shadow-md",
                    isBulbOn ? "translate-x-9" : "translate-x-1"
                  )}
                >
                  {isUpdating && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </div>
                  )}
                </span>
              </button>
              <span className={cn(
                "text-[12px] font-medium uppercase tracking-wider",
                isBulbOn ? "text-primary" : "text-slate-400"
              )}>On</span>
            </div>
          </div>

          {!isOnline && (
            <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
              <Info size={12} />
              HARDWARE CONNECTION REQUIRED
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
