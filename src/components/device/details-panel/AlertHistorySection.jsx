import { CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { cn } from "../../../utils/cn";

/**
 * AlertHistorySection Component
 * Chronological feed of recent device events.
 */
export const AlertHistorySection = ({ deviceId, auditLogs }) => {
  // Requirement: Filter logs specific to this device
  const deviceLogs = auditLogs
    .filter((l) => l.targetId === deviceId || l.details?.includes(deviceId))
    .slice(0, 5);

  return (
    <section id="section-alerts" className="scroll-mt-6 pb-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-display text-lg font-bold text-primary">Alert History</h3>
      </div>

      <div className="space-y-3">
        {deviceLogs.length > 0 ? (
          deviceLogs.map((log) => <AlertItem key={log.id} log={log} />)
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
            <Info className="mx-auto text-slate-300 mb-3" size={24} />
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">
              No recent alerts
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

const AlertItem = ({ log }) => {
  const getAlertConfig = (action, severity) => {
    const act = action?.toUpperCase() || "";
    if (act.includes("FAILURE") || severity === "critical")
      return { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50" };
    if (act.includes("TOGGLED")) return { icon: Info, color: "text-blue-500", bg: "bg-blue-50" };
    return { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" };
  };

  const config = getAlertConfig(log.action, log.severity);
  const timeAgo = log.createdAt
    ? new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "Just now";

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
          config.bg,
          config.color
        )}
      >
        <config.icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-sans font-bold text-[14px] text-slate-700 truncate">
          {log.action?.replace(/_/g, " ")}
        </p>
        <p className="text-[12px] text-slate-400 font-medium truncate">{log.details}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[10px] font-bold text-slate-300 uppercase">{timeAgo}</p>
        <div
          className={cn("w-2 h-2 rounded-full ml-auto mt-1 shadow-sm", config.color.replace("text", "bg"))}
        />
      </div>
    </div>
  );
};
