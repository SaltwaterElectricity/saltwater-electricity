import { memo } from "react";
import { Power, RefreshCw } from "lucide-react";
import { cn } from "../../../utils/cn";

/**
 * ResidentSystemLogsWidget Component
 * Mirrors the "SYSTEM LOGS" widget from legacy user-dashboard.html
 */
const ResidentSystemLogsWidget = memo(({ logs = [], loading = false }) => {
  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col h-[400px] shadow-sm border border-outline-variant/30">
      <div className="flex justify-between items-center mb-6">
        <h5 className="text-[12px] font-bold text-on-surface uppercase tracking-tight">
          SYSTEM LOGS
        </h5>
        <button className="text-primary text-label-sm font-bold px-3 py-1 border border-outline-variant/30 rounded-lg bg-white shadow-sm hover:bg-surface-container-low transition-colors">
          View All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-full opacity-30">
            <RefreshCw className="animate-spin w-10 h-10 text-primary" />
          </div>
        ) : logs.length > 0 ? (
          <div className="space-y-0">
            {logs.map((log, index) => {
              const isLast = index === logs.length - 1;
              const isPowerOn = log.details?.toLowerCase().includes("on") || log.action?.includes("ON");
              const isPowerOff = log.details?.toLowerCase().includes("off") || log.action?.includes("OFF");

              return (
                <div
                  key={log.id || index}
                  className={cn(
                    "flex items-center gap-4 py-4",
                    !isLast && "border-b border-dotted border-outline-variant/30"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      isPowerOn ? "bg-green-50" : isPowerOff ? "bg-red-50" : "bg-blue-50"
                    )}
                  >
                    <Power
                      size={20}
                      className={cn(
                        isPowerOn ? "text-green-500" : isPowerOff ? "text-red-500" : "text-blue-500"
                      )}
                    />
                  </div>
                  <div>
                    <p className="text-label-md font-bold text-on-surface leading-tight">
                      {log.details || log.action || "System event recorded"}
                    </p>
                    <p className="text-[12px] text-on-surface-variant font-medium mt-1">
                      {new Date(log.timestamp).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full opacity-40 text-center">
            <p className="text-label-sm font-bold uppercase tracking-widest text-on-surface-variant">
              No Activity Logs
            </p>
            <p className="text-[11px] font-medium text-outline mt-1">
              Events will appear here as you interact with your devices.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

ResidentSystemLogsWidget.displayName = "ResidentSystemLogsWidget";

export default ResidentSystemLogsWidget;
