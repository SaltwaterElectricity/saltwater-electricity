import { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, Info, BellRing } from "lucide-react";
import { cn } from "../../../utils/cn";

/**
 * AlertHistorySection Component
 * Chronological feed of recent device events with hydration animations.
 */
export const AlertHistorySection = ({ deviceId, auditLogs }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Requirement: Filter logs specific to this device
  const deviceLogs = auditLogs
    .filter((l) => l.targetId === deviceId || l.details?.includes(deviceId))
    .slice(0, 5);

  return (
    <section id="section-alerts" className="scroll-mt-6 pb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-display text-lg font-bold text-primary">System Activity Feed</h3>
        {deviceLogs.length > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-full border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Live Sync</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {deviceLogs.length > 0 ? (
          deviceLogs.map((log, idx) => (
            <AlertItem 
              key={log.id} 
              log={log} 
              index={idx} 
              isMounted={isMounted}
            />
          ))
        ) : (
          <div className="text-center py-16 bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200 group hover:bg-slate-50 transition-colors duration-500">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500">
              <BellRing className="text-slate-200" size={32} />
            </div>
            <p className="text-[13px] font-bold text-slate-400 uppercase tracking-[0.2em] px-6">
              Clear Skies: No recent alerts detected
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

const AlertItem = ({ log, index, isMounted }) => {
  const getAlertConfig = (action, severity) => {
    const act = action?.toUpperCase() || "";
    if (act.includes("FAILURE") || severity === "critical")
      return { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50", label: "Critical" };
    if (act.includes("TOGGLED")) 
      return { icon: Info, color: "text-blue-500", bg: "bg-blue-50", label: "Control" };
    return { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", label: "Status" };
  };

  const config = getAlertConfig(log.action, log.severity);
  const timeAgo = log.createdAt
    ? new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "Just now";

  return (
    <div 
      className={cn(
        "flex items-center gap-4 p-5 rounded-[24px] bg-white border border-slate-100 hover:shadow-xl transition-all duration-500 group relative overflow-hidden",
        !isMounted ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      )}
      style={{ 
        transitionDelay: `${index * 80}ms`,
        transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)"
      }}
    >
      <div
        className={cn(
          "w-12 h-12 rounded-[18px] flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110 shadow-sm",
          config.bg,
          config.color
        )}
      >
        <config.icon size={22} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-display font-black text-[15px] text-slate-900 truncate tracking-tight">
            {log.action?.replace(/_/g, " ")}
          </p>
          <span className={cn("text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md", config.bg, config.color)}>
            {config.label}
          </span>
        </div>
        <p className="text-[13px] text-slate-400 font-medium truncate leading-none">
          {log.details}
        </p>
      </div>

      <div className="text-right shrink-0">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{timeAgo}</p>
        <div
          className={cn(
            "w-2 h-2 rounded-full ml-auto mt-2 shadow-inner",
            config.color.replace("text", "bg")
          )}
        />
      </div>

      {/* Subtle hover indicator */}
      <div className={cn("absolute left-0 top-0 w-1 h-full transition-transform duration-500 scale-y-0 group-hover:scale-y-100", config.color.replace("text", "bg"))} />
    </div>
  );
};
