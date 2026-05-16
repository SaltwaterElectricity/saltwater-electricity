import { memo } from "react";

/**
 * SystemAlerts Component
 * Displays a list of system alerts with different severity levels.
 * Derived from dashboard.html mockup.
 */
const SystemAlerts = memo(({ alerts = [] }) => {
  const getSeverityStyles = (severity) => {
    switch (severity?.toLowerCase()) {
      case "error":
        return {
          bg: "bg-red-50/50",
          border: "border-red-100/50",
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
          icon: "error"
        };
      case "warning":
        return {
          bg: "bg-orange-50/50",
          border: "border-orange-100/50",
          iconBg: "bg-orange-100",
          iconColor: "text-orange-600",
          icon: "warning"
        };
      case "info":
      default:
        return {
          bg: "bg-blue-50/50",
          border: "border-blue-100/50",
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600",
          icon: "info"
        };
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col h-full border border-outline-variant/10">
      <h3 className="font-bold text-sm uppercase tracking-wider text-on-surface-variant mb-6">
        System Alerts
      </h3>
      
      <div className="space-y-4 mb-6 flex-1 overflow-y-auto custom-scrollbar">
        {alerts.length > 0 ? (
          alerts.map((alert) => {
            const styles = getSeverityStyles(alert.severity);
            const alertKey = alert.id || `${alert.title}-${alert.time}`;
            return (
              <div 
                key={alertKey} 
                className={`flex gap-4 p-4 rounded-lg ${styles.bg} border ${styles.border} transition-all hover:scale-[1.01]`}
              >
                <div className={`w-10 h-10 rounded-lg ${styles.iconBg} flex items-center justify-center ${styles.iconColor} flex-shrink-0`}>
                  <span className="material-symbols-outlined text-[20px] fill">
                    {styles.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-xs text-on-surface truncate">
                      {alert.title}
                    </p>
                    <span className="text-[10px] text-outline flex-shrink-0 ml-2">
                      {alert.time}
                    </span>
                  </div>
                  <p className="text-[10px] text-outline mt-1 leading-relaxed line-clamp-2">
                    {alert.message}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-outline">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-20">notifications_off</span>
            <p className="text-xs font-bold uppercase tracking-widest italic">No active alerts</p>
          </div>
        )}
      </div>
      
      <button className="w-full text-primary font-bold text-xs flex items-center justify-center gap-2 py-3 border border-primary/10 bg-primary/5 rounded-lg hover:bg-primary/10 transition-all group">
        View all alerts 
        <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
          arrow_forward
        </span>
      </button>
    </div>
  );
});

SystemAlerts.displayName = "SystemAlerts";

export default SystemAlerts;
