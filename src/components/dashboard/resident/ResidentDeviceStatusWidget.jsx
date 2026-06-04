import { memo } from "react";
import { Zap, Activity, Cpu, ChevronRight } from "lucide-react";

/**
 * ResidentDeviceStatusWidget Component
 * Shows real-time snapshot of ALL assigned devices' status.
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
          const isActive = reading.voltage > 0;

          return (
            <div
              key={device.device_id}
              className="p-4 rounded-2xl border border-outline-variant/10 bg-surface-bright/50 hover:bg-white transition-colors group/item"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"}`}
                  >
                    <Cpu size={16} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-on-surface leading-none truncate max-w-[120px]">
                      {device.device_name || device.device_id}
                    </p>
                    <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">
                      ID: {device.device_id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? "bg-green-50 text-green-600" : "bg-slate-50 text-slate-400"}`}
                >
                  <span
                    className={`w-1 h-1 rounded-full ${isActive ? "bg-green-500" : "bg-slate-400"}`}
                  />
                  {isActive ? "Active" : "Standby"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-primary" />
                  <span className="text-label-sm font-bold text-on-surface">
                    {reading.voltage || "0.00"} V
                  </span>
                </div>
                <div className="flex items-center gap-2 border-l border-outline-variant/20 pl-4">
                  <Activity size={14} className="text-secondary" />
                  <span className="text-label-sm font-bold text-on-surface">
                    {reading.tds || reading.tds_ppm || "0"} ppt
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onViewAll}
        className="w-full mt-6 py-3.5 primary-gradient rounded-xl text-label-md font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:brightness-110 flex items-center justify-center gap-2"
      >
        View Real-Time
        <ChevronRight size={18} />
      </button>
    </div>
  );
});

ResidentDeviceStatusWidget.displayName = "ResidentDeviceStatusWidget";

export default ResidentDeviceStatusWidget;
