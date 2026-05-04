import { memo } from "react";
import { cn } from "../../utils/cn";

/**
 * EventItem Component
 * Individual alert/event in the feed.
 */
const EventItem = memo(({ severity, type, message, timestamp, station }) => {
  const configs = {
    critical: {
      bg: "bg-error-container/10",
      border: "border-error",
      icon: "report",
      iconColor: "text-error",
      label: "Critical Error"
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-500",
      icon: "warning",
      iconColor: "text-yellow-600",
      label: "Warning"
    },
    normal: {
      bg: "bg-blue-50",
      border: "border-blue-500",
      icon: "check_circle",
      iconColor: "text-blue-600",
      label: type || "User Action"
    }
  };

  const config = configs[severity] || configs.normal;

  return (
    <div className={cn("flex space-x-3 p-sm rounded-xl border-l-4 font-['Inter']", config.bg, config.border)}>
      <span className={cn("material-symbols-outlined text-xl", config.iconColor)}>
        {config.icon}
      </span>
      <div>
        <div className={cn("text-xs font-bold uppercase tracking-widest", config.iconColor)}>
          {config.label}
        </div>
        <div className="text-sm font-medium text-slate-800">{message}</div>
        <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-tight">
          {timestamp} • Station: {station}
        </div>
      </div>
    </div>
  );
});

/**
 * EventFeed Component
 * Sidebar list for real-time system events.
 * Follows severity color-coding (Red, Yellow, Blue).
 */
const EventFeed = memo(({ events = [] }) => {
  return (
    <div className="glass-panel h-[480px] flex flex-col">
      <div className="p-md border-b border-white/40 flex justify-between items-center">
        <h3 className="font-h2 text-h2 text-primary font-['Space_Grotesk'] tracking-tight">System Events</h3>
        <span className="bg-slate-100 text-[10px] font-bold px-2 py-1 rounded font-['Inter'] uppercase tracking-widest">
          LIVE FEED
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-md space-y-4 custom-scrollbar-hide">
        {events.map((event, index) => (
          <EventItem key={event.id || index} {...event} />
        ))}
        {events.length === 0 && (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs italic font-['Inter']">
            Awaiting live telemetry...
          </div>
        )}
      </div>

      <div className="p-md text-center border-t border-white/40">
        <a className="text-sm font-bold text-blue-600 hover:underline font-['Inter'] uppercase tracking-widest" href="#">
          View All Logs
        </a>
      </div>
    </div>
  );
});

export default EventFeed;
