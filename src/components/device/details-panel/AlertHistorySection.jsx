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
    <section id="section-alerts" className="scroll-mt-6">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-5">
        Alert History
      </h3>

      <div className="space-y-3">
        {deviceLogs.length > 0 ? (
          deviceLogs.map((log) => <AlertItem key={log.id} log={log} />)
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-[28px] border border-dashed border-slate-200">
            <Info className="mx-auto text-slate-300 mb-2.5" size={20} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
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
    : "Recently";

  return (
    <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors group">
      <div
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
          config.bg,
          config.color
        )}
      >
        <config.icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-slate-700 truncate">
          {log.action?.replace(/_/g, " ")}
        </p>
        <p className="text-[10px] text-slate-400 font-medium truncate">{log.details}</p>
      </div>
      <div className="text-right">
        <p className="text-[8px] font-black text-slate-300 uppercase">{timeAgo}</p>
        <div
          className={cn("w-1 h-1 rounded-full ml-auto mt-1", config.color.replace("text", "bg"))}
        />
      </div>
    </div>
  );
};
