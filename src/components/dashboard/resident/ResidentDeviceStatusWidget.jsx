import { memo } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../../../utils/cn";

/**
 * ResidentDeviceStatusWidget Component
 * Shows high-fidelity real-time snapshot of ALL assigned devices' status.
 * Mirrored from legacy user-dashboard.html metrics style.
 */
const ResidentDeviceStatusWidget = memo(({ userDevices = [], telemetry = {}, onViewAll }) => {
  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col hover:border-primary/30 transition-all duration-300 group shadow-sm border border-outline-variant/30 h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h5 className="text-[12px] font-bold text-on-surface tracking-tight uppercase">
          DEVICE STATUS
        </h5>
        <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
          {userDevices.length} {userDevices.length === 1 ? "Node" : "Nodes"}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
        {userDevices.map((device) => {
          const reading = telemetry[device.device_id] || {};
          const isActive = (reading.voltage || 0) > 0;

          return (
            <div
              key={device.device_id}
              className="p-4 rounded-2xl border border-outline-variant/10 bg-surface-bright/50 hover:bg-white transition-colors group/item"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                      isActive ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"
                    )}
                  >
                    <span className="material-symbols-outlined text-[20px]">router</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-on-surface leading-none truncate max-w-[120px]">
                      {device.device_name || `Node ${device.device_id.slice(-4).toUpperCase()}`}
                    </p>
                    <p className="text-[10px] text-on-surface-variant font-medium mt-1">
                      ID: {device.device_id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold",
                    isActive ? "bg-green-50 text-green-600" : "bg-slate-50 text-slate-400"
                  )}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full animate-pulse",
                      isActive ? "bg-green-500" : "bg-slate-400"
                    )}
                  />
                  {isActive ? "Active" : "Standby"}
                </div>
              </div>

              {/* Technical Metrics Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center p-2 rounded-xl bg-white/50 border border-outline-variant/5">
                  <span className="material-symbols-outlined text-[18px] text-primary mb-1">
                    bolt
                  </span>
                  <p className="text-[11px] font-bold text-on-surface leading-none">
                    {reading.voltage?.toFixed(1) || "0.0"}V
                  </p>
                  <p className="text-[8px] text-on-surface-variant font-bold uppercase mt-1">
                    Volt
                  </p>
                </div>
                <div className="flex flex-col items-center p-2 rounded-xl bg-white/50 border border-outline-variant/5">
                  <span
                    className="material-symbols-outlined text-[18px] text-primary mb-1"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    stars
                  </span>
                  <p className="text-[11px] font-bold text-on-surface leading-none">
                    {reading.current?.toFixed(2) || "0.00"}A
                  </p>
                  <p className="text-[8px] text-on-surface-variant font-bold uppercase mt-1">Amp</p>
                </div>
                <div className="flex flex-col items-center p-2 rounded-xl bg-white/50 border border-outline-variant/5">
                  <span className="material-symbols-outlined text-[18px] text-primary mb-1">
                    water_drop
                  </span>
                  <p className="text-[11px] font-bold text-on-surface leading-none">
                    {Math.round(reading.tds || reading.tds_ppm || 0)}
                  </p>
                  <p className="text-[8px] text-on-surface-variant font-bold uppercase mt-1">PPT</p>
                </div>
              </div>
            </div>
          );
        })}

        {userDevices.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-40 py-10">
            <span className="material-symbols-outlined text-[48px] mb-2 text-on-surface-variant">
              router
            </span>
            <p className="text-label-sm font-bold uppercase tracking-widest">No Nodes Found</p>
          </div>
        )}
      </div>

      <button
        onClick={onViewAll}
        className="w-full mt-6 py-3.5 primary-gradient rounded-xl text-label-md font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:brightness-110 flex items-center justify-center gap-2"
      >
        View Real-Time Monitor
        <ChevronRight size={18} />
      </button>
    </div>
  );
});

ResidentDeviceStatusWidget.displayName = "ResidentDeviceStatusWidget";

export default ResidentDeviceStatusWidget;
