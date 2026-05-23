import { memo } from "react";
import { Bell, Activity, Clock, ShieldAlert } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * RecentAlertsFeed Component
 * A unified alert feed that handles both Audit Logs and System Notifications.
 */
const RecentAlertsFeed = memo(
  ({
    alerts = [],
    title = "Recent Alerts",
    variant = "sidebar", // 'sidebar' | 'widget'
    onViewAll,
    loading = false,
    emptyMessage = "No active alerts recorded.",
  }) => {
    const isSidebar = variant === "sidebar";

    return (
      <div
        className={cn(
          "bg-cardBg rounded-3xl shadow-premium flex flex-col border border-white/40 overflow-hidden transition-all hover:shadow-2xl",
          isSidebar ? "h-[520px]" : "h-full min-h-[400px]"
        )}
      >
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-slate-50 bg-slate-50/30">
          <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-slate-800">{title}</h3>
          <button
            onClick={onViewAll}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
          >
            <Bell size={16} />
          </button>
        </div>

        {/* Feed Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full opacity-30 animate-pulse">
              <Activity size={32} className="mb-2 text-primary animate-spin" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Syncing Feed...</p>
            </div>
          ) : alerts.length > 0 ? (
            alerts.map((log) => {
              // Logic for Audit Logs vs Notifications
              const actionType = log.action || log.type || "";
              const isCritical =
                actionType.includes("FAILURE") ||
                actionType.includes("CRITICAL") ||
                actionType.includes("DEP") ||
                actionType === "critical";

              const isWarning =
                actionType.includes("WARNING") ||
                actionType.includes("UPDATE") ||
                actionType === "warning";

              const displayTitle = log.action ? log.action.replace(/_/g, " ") : log.title;
              const displayDetails = log.details || log.message || "System activity recorded.";
              const timestamp = log.timestamp;

              return (
                <div
                  key={log.id || log.timestamp}
                  className="flex items-start space-x-4 p-3 -m-3 hover:bg-slate-50/80 rounded-2xl transition-all cursor-default group"
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border transition-all group-hover:scale-110",
                      isCritical
                        ? "bg-red-50 text-red-500 border-red-100 shadow-sm shadow-red-100"
                        : isWarning
                          ? "bg-orange-50 text-orange-500 border-orange-100 shadow-sm shadow-orange-100"
                          : "bg-blue-50 text-blue-500 border-blue-100 shadow-sm shadow-blue-100"
                    )}
                  >
                    {isCritical ? (
                      <ShieldAlert size={18} />
                    ) : isWarning ? (
                      <Clock size={18} />
                    ) : (
                      <Activity size={18} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-800 truncate uppercase tracking-tighter group-hover:text-primary transition-colors">
                        {displayTitle}
                      </h4>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium leading-relaxed line-clamp-2">
                      {displayDetails}
                    </p>
                    <p className="text-[9px] text-slate-300 mt-1.5 font-bold uppercase tracking-widest">
                      {new Date(timestamp).toLocaleDateString()} •{" "}
                      {new Date(timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-30">
              <Activity size={40} className="mb-4 text-slate-400" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                {emptyMessage}
              </p>
            </div>
          )}
        </div>

        {/* Footer (Optional View All button) */}
        {onViewAll && (
          <div className="p-5 border-t border-slate-50 text-center bg-slate-50/30">
            <button
              onClick={onViewAll}
              className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
            >
              View All Notifications
            </button>
          </div>
        )}
      </div>
    );
  }
);

RecentAlertsFeed.displayName = "RecentAlertsFeed";

export default RecentAlertsFeed;
