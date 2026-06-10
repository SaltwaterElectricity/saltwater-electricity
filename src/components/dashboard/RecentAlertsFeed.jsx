import { memo } from "react";
import { Activity, Clock, ShieldAlert, Info, ArrowRight } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * RecentAlertsFeed Component
 * Mirrors the "System Alerts" section from dashboard.html.
 * Unified alert feed that handles both Audit Logs and System Notifications.
 */
const RecentAlertsFeed = memo(
  ({
    alerts = [],
    title = "System Alerts",
    variant = "sidebar", // 'sidebar' | 'widget'
    onViewAll,
    loading = false,
    emptyMessage = "No active alerts recorded.",
  }) => {
    const isSidebar = variant === "sidebar";

    return (
      <div
        className={cn(
          "bg-white rounded-xl shadow-sm flex flex-col border border-outline-variant/10 overflow-hidden",
          isSidebar ? "h-[520px]" : "h-[450px]"
        )}
      >
        {/* Header */}
        <div className="p-6 flex items-center justify-between">
          <h3 className="font-bold text-sm uppercase tracking-wider text-on-surface-variant">
            {title}
          </h3>
        </div>

        {/* Feed Body */}
        <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-4 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full opacity-30 animate-pulse">
              <Activity size={32} className="mb-2 text-primary animate-spin" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Syncing Feed...</p>
            </div>
          ) : alerts.length > 0 ? (
            alerts.slice(0, 5).map((log) => {
              const actionType = log.action || log.type || "";
              const isCritical =
                actionType.includes("FAILURE") ||
                actionType.includes("CRITICAL") ||
                actionType === "critical";

              const isWarning = actionType.includes("WARNING") || actionType === "warning";

              const displayTitle = log.action ? log.action.replace(/_/g, " ") : log.title;
              const displayDetails = log.details || log.message || "System activity recorded.";
              const timestamp = log.timestamp;

              return (
                <div
                  key={log.id || log.timestamp}
                  className={cn(
                    "flex gap-4 p-4 rounded-lg border",
                    isCritical
                      ? "bg-red-50/50 border-red-100/50"
                      : isWarning
                        ? "bg-orange-50/50 border-orange-100/50"
                        : "bg-blue-50/50 border-blue-100/50"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center transition-all",
                      isCritical
                        ? "bg-red-100 text-red-600"
                        : isWarning
                          ? "bg-orange-100 text-orange-600"
                          : "bg-blue-100 text-blue-600"
                    )}
                  >
                    {isCritical ? (
                      <ShieldAlert size={20} />
                    ) : isWarning ? (
                      <Clock size={20} />
                    ) : (
                      <Info size={20} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-xs text-on-surface truncate pr-2">
                        {displayTitle}
                      </p>
                      <span className="text-[10px] text-outline whitespace-nowrap">
                        {getTimeAgo(timestamp)}
                      </span>
                    </div>
                    <p className="text-[10px] text-outline mt-1 leading-relaxed line-clamp-2">
                      {displayDetails}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-10 opacity-30">
              <Activity size={40} className="mb-4 text-outline" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
                {emptyMessage}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {onViewAll && (
          <div className="p-6 pt-0 mt-2">
            <button
              onClick={onViewAll}
              className="w-full text-primary font-bold text-xs flex items-center justify-center gap-2 py-3 border border-primary/10 bg-primary/5 rounded-lg hover:bg-primary/10 transition-all"
            >
              View all alerts <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  }
);

// Helper for relative time
const getTimeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - new Date(timestamp)) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return new Date(timestamp).toLocaleDateString();
};

RecentAlertsFeed.displayName = "RecentAlertsFeed";

export default RecentAlertsFeed;
