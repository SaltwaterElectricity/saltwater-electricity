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
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-5">
        Device Controls
      </h3>

      <div
        className={cn(
          "bg-white border rounded-2xl p-6 transition-all duration-300",
          isBulbOn
            ? "border-orange-200 shadow-lg shadow-orange-50/50"
            : "border-slate-100 shadow-sm"
        )}
      >
        <div className="flex flex-col items-center text-center space-y-5">
          {/* Bulb Icon with Visual Feedback */}
          <div className="relative">
            <div
              className={cn(
                "w-16 h-16 flex items-center justify-center rounded-2xl transition-all duration-500",
                isBulbOn
                  ? "bg-orange-100 shadow-[0_0_20px_rgba(249,115,22,0.3)] animate-subtle-pulse"
                  : "bg-slate-50 shadow-inner"
              )}
            >
              <Lightbulb
                size={32}
                className={cn(
                  "transition-colors duration-500",
                  isBulbOn ? "text-orange-500 fill-orange-500/20" : "text-slate-300"
                )}
              />
            </div>

            {/* Status Dot */}
            <div
              className={cn(
                "absolute -top-1 -right-1 w-5 h-5 rounded-full border-4 border-white flex items-center justify-center transition-colors",
                isOnline ? "bg-emerald-500" : "bg-slate-300"
              )}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <p className="font-display text-base font-black text-slate-900 uppercase">
                Smart Bulb Power
              </p>
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded text-[8px] font-bold tracking-widest uppercase border",
                  isOnline
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : "bg-slate-50 text-slate-400 border-slate-100"
                )}
              >
                {isOnline ? "Sync" : "No Sync"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-[180px]">
              Remote toggle for manual lighting override.
            </p>
          </div>

          {/* iOS-Style Toggle Switch */}
          <div className="flex items-center gap-4 pt-1">
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
              OFF
            </span>
            <button
              onClick={handleToggle}
              disabled={isUpdating || !isOnline}
              className={cn(
                "relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-500 focus:outline-none",
                isBulbOn ? "bg-primary shadow-lg shadow-primary/20" : "bg-slate-200",
                (isUpdating || !isOnline) && "opacity-50 cursor-not-allowed"
              )}
            >
              <span
                className={cn(
                  "inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-500 shadow-md",
                  isBulbOn ? "translate-x-8" : "translate-x-1"
                )}
              >
                {isUpdating && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  </div>
                )}
              </span>
            </button>
            <span
              className={cn(
                "text-[9px] font-black uppercase tracking-widest",
                isBulbOn ? "text-primary" : "text-slate-300"
              )}
            >
              ON
            </span>
          </div>

          {!isOnline && (
            <div className="flex items-center gap-2 text-[9px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
              <Info size={10} />
              CONTROLS RESTRICTED
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
