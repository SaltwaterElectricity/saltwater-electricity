import { useState, useMemo } from "react";
import { useAuth } from "../../context/useAuth";
import { useNotifications } from "../../hooks/useNotifications";
import { cn } from "../../utils/cn";
import { Footer } from "../../layout";

/**
 * Alerts Component
 * High-fidelity alerts feed refactored to mirror user-alert-notifications.html precisely.
 * Supports role-based fetching and real-time filtering.
 */
const Alerts = () => {
  const { currentUser, isAdmin } = useAuth();
  const [filter, setFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Requirement 2: Role-Based Logic
  // Admins fetch system-wide 'admin' alerts; Residents fetch personalized UID alerts.
  const { notifications, loading } = useNotifications(isAdmin ? "admin" : currentUser?.uid);

  // Requirement 3: State Management - Filtering & Grouping
  const groupedNotifications = useMemo(() => {
    if (!notifications) return {};

    const filtered = notifications.filter((n) => {
      const status = n.isRead ? "read" : "unread";
      if (filter === "all") return true;
      return status === filter;
    });

    const groups = {};
    filtered.forEach((n) => {
      const date = new Date(n.timestamp);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      let key = "OLDER";
      if (date.toDateString() === today.toDateString()) {
        key = "TODAY";
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = "YESTERDAY";
      } else {
        key = date
          .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
          .toUpperCase();
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(n);
    });
    return groups;
  }, [notifications, filter]);

  // Helper: Time Ago Logic
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "Just now";
    const diff = new Date().getTime() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-8">
      {/* 1. CONTENT HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-h2 font-bold text-on-surface">ALERTS AND NOTIFICATIONS</h2>
          <p className="text-on-surface-variant font-body-md mt-1">
            Track important device alerts, warnings, and system notifications in real-time.
          </p>
        </div>

        {/* Filter Dropdown */}
        <div
          className="relative group self-end md:self-auto"
          onMouseLeave={() => setIsFilterOpen(false)}
        >
          <button
            onMouseEnter={() => setIsFilterOpen(true)}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-outline-variant/50 rounded-xl font-label-md text-label-md text-on-surface-variant hover:border-primary transition-all shadow-[0px_12px_32px_-4px_rgba(10,46,255,0.04)]"
          >
            <span className="capitalize">{filter === "all" ? "All Notifications" : filter}</span>
            <span className="material-symbols-outlined text-[20px]">expand_more</span>
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-outline-variant/20 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {["all", "unread", "read"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setFilter(opt);
                    setIsFilterOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors capitalize",
                    filter === opt
                      ? "text-primary font-bold border-l-4 border-primary bg-primary/5"
                      : "text-on-surface-variant"
                  )}
                >
                  {opt === "all" ? "All" : opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. MAIN NOTIFICATION CONTAINER */}
      <div className="bg-white rounded-[24px] shadow-[0px_12px_32px_-4px_rgba(10,46,255,0.04)] border border-outline-variant/30 overflow-hidden p-6 md:p-8 min-h-[600px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-50">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">
              sync
            </span>
            <span className="text-label-sm font-bold text-outline uppercase tracking-[0.3em]">
              Synchronizing Secure Stream...
            </span>
          </div>
        ) : Object.keys(groupedNotifications).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6 opacity-30">
            <span className="material-symbols-outlined text-6xl">notifications_off</span>
            <div className="text-center">
              <h4 className="text-xl font-bold text-primary uppercase">No Active Alerts</h4>
              <p className="text-label-sm font-bold text-on-surface-variant uppercase tracking-widest mt-1">
                Facility status is optimal
              </p>
            </div>
          </div>
        ) : (
          Object.entries(groupedNotifications).map(([group, list]) => (
            <div key={group} className="mb-10 last:mb-0">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[12px] font-bold text-outline tracking-widest uppercase">
                  {group}
                </span>
                <div className="flex-1 h-px bg-outline-variant/20" />
              </div>

              <div className="space-y-3">
                {list.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-white border border-outline-variant/20 rounded-xl hover:shadow-md transition-all duration-200 group/card hover:bg-primary/[0.02] notification-card"
                  >
                    {/* Icon Indicator */}
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover/card:scale-110",
                        alert.type === "critical"
                          ? "bg-error/10 text-error"
                          : alert.type === "warning"
                            ? "bg-secondary/10 text-secondary"
                            : "bg-primary/10 text-primary"
                      )}
                    >
                      <span className="material-symbols-outlined text-[24px]">
                        {alert.type === "critical"
                          ? "warning"
                          : alert.type === "warning"
                            ? "warning"
                            : "info"}
                      </span>
                    </div>

                    {/* Alert Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-on-surface uppercase truncate group-hover/card:text-primary transition-colors">
                        {alert.title}
                      </h4>
                      <p className="text-on-surface-variant text-sm mt-0.5 line-clamp-1">
                        {alert.message}
                      </p>
                    </div>

                    {/* Metadata: Time Ago */}
                    <div className="flex items-center gap-1.5 text-on-surface-variant text-xs whitespace-nowrap opacity-70">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      {formatTimeAgo(alert.timestamp)}
                    </div>

                    {/* Status Badge */}
                    <div className="md:ml-4">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                          alert.isRead
                            ? "bg-surface-container text-outline"
                            : "bg-primary-fixed text-primary shadow-sm"
                        )}
                      >
                        {alert.isRead ? "Read" : "Unread"}
                      </span>
                    </div>

                    {/* Action Button */}
                    <button className="md:ml-4 flex items-center justify-center gap-1 px-4 py-2 border border-outline-variant/50 rounded-lg text-on-surface text-sm font-medium hover:bg-primary hover:text-white hover:border-primary transition-all btn-interactive">
                      Details
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Alerts;
