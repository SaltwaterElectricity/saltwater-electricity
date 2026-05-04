import { cn } from "../../utils/cn";

/**
 * SYSTEM EVENT ITEM
 */
export const EventItem = ({ log }) => {
  const isCritical = log.action?.toLowerCase().includes('delete') || log.action?.toLowerCase().includes('disable') || log.action?.toLowerCase().includes('critical');
  const isWarning = log.action?.toLowerCase().includes('update') || log.action?.toLowerCase().includes('request') || log.action?.toLowerCase().includes('alert');

  return (
    <div className={cn(
      "flex space-x-3 p-sm rounded-xl border-l-4",
      isCritical ? "bg-error-container/10 border-error" : 
      isWarning ? "bg-yellow-50 border-yellow-500" : "bg-blue-50 border-blue-500"
    )}>
      <span className={cn(
        "material-symbols-outlined text-xl",
        isCritical ? "text-error" : isWarning ? "text-yellow-600" : "text-blue-600"
      )}>
        {isCritical ? "report" : isWarning ? "warning" : "check_circle"}
      </span>
      <div>
        <div className={cn(
          "text-xs font-bold uppercase",
          isCritical ? "text-error" : isWarning ? "text-yellow-600" : "text-blue-600"
        )}>
          {isCritical ? "Critical Action" : isWarning ? "System Update" : "User Action"}
        </div>
        <div className="text-sm font-medium text-slate-800">{log.action?.replace(/_/g, ' ')}</div>
        <div className="text-[10px] text-slate-400 mt-1">
          {new Date(log.createdAt).toLocaleString()} • Target: {log.targetId?.substring(0, 10)}
        </div>
      </div>
    </div>
  );
};
