import { useMemo } from "react";
import { History, ShieldCheck, Zap, Droplets, Activity } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { useDevices, useHistory, useNotifications } from "../../hooks";
import { DeviceAnalyticsChart } from "../../components";
import { processLogsInWindows } from "../../utils/chartUtils";
import { METRICS, METRIC_CONFIG, SENSOR_CONFIG } from "../../constants";
import { cn } from "../../utils/cn";
import { Footer } from "../../layout";

/**
 * ResidentDashboard Component
 * High-fidelity personal monitoring hub for residents.
 * Refactored using the AlonKuryente "Page Canvas" structure from USERDASHBOARD.html.
 */
const ResidentDashboard = () => {
  const { user } = useAuth();
  const { devices, loading: devicesLoading } = useDevices();

  // Find the device assigned to the current resident
  const userDevice = useMemo(() => {
    if (!user || !devices) return null;
    return devices.find((d) => d.assigned_user_id === user.uid || d.assigned_user_id === user.id);
  }, [user, devices]);

  const deviceId = userDevice?.device_id;

  // Fetch Logs and Notifications
  const { logs, loading: logsLoading } = useHistory(deviceId);
  const { notifications, loading: notificationsLoading } = useNotifications(user?.uid);

  // Latest entry for the overview grid
  const latestLog = useMemo(() => (logs && logs.length > 0 ? logs[0] : null), [logs]);

  // Process data for charts
  const voltageChartData = useMemo(() => {
    if (!logs || logs.length === 0) return [];
    return processLogsInWindows(logs, {
      metricKey: "voltage",
      metricId: METRICS.VOLTAGE,
    }).current;
  }, [logs]);

  const salinityChartData = useMemo(() => {
    if (!logs || logs.length === 0) return [];
    return processLogsInWindows(logs, {
      metricKey: "tds_ppm",
      metricId: METRICS.TDS,
    }).current;
  }, [logs]);

  // Derived Health Status
  const healthStatus = useMemo(() => {
    if (!latestLog) return { label: "Unknown", color: "text-outline", bg: "bg-surface-container" };
    const tds = latestLog.tds_ppm;
    const config = SENSOR_CONFIG[METRICS.TDS];
    if (tds < config.warning) return { label: "Optimal", color: "text-tertiary", bg: "bg-tertiary-fixed-dim/20" };
    if (tds < config.critical) return { label: "Stable", color: "text-primary", bg: "bg-primary-container/10" };
    return { label: "Critical", color: "text-error", bg: "bg-error/10" };
  }, [latestLog]);

  if (devicesLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-label-sm font-semibold text-outline uppercase tracking-widest mt-4 animate-pulse font-label-sm">
          Syncing Facility Data...
        </p>
      </div>
    );
  }

  if (!userDevice) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center">
        <div className="max-w-md p-12 glass-panel shadow-xl animate-in fade-in zoom-in-95 duration-500 rounded-xl">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-primary shadow-inner">
            <History size={32} />
          </div>
          <h2 className="text-h2 font-h2 font-bold text-primary tracking-tight italic">
            No Active Node
          </h2>
          <p className="text-body-md text-on-surface-variant mt-4 leading-relaxed font-body-md">
            Your account doesn&apos;t have an assigned monitoring unit yet. Contact the facility
            administrator to provision your hardware.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 space-y-margin antialiased text-on-surface">
      {/* 1. SYSTEM OVERVIEW GRID (3 Columns) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {/* Voltage Card */}
        <div className="glass-panel rounded-xl p-md flex items-center justify-between ocean-glow transition-all duration-300">
          <div>
            <p className="text-on-surface-variant font-display text-label-sm mb-1 uppercase tracking-widest">Voltage Level</p>
            <h3 className="font-display text-h1 text-primary">{latestLog?.voltage ? `${latestLog.voltage}V` : "0.00V"}</h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-tertiary-fixed-dim/20 text-tertiary text-xs font-bold mt-2">
              <Zap size={14} className="mr-1" /> active
            </span>
          </div>
          <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-3xl">bolt</span>
          </div>
        </div>

        {/* Salinity Card */}
        <div className="glass-panel rounded-xl p-md flex items-center justify-between ocean-glow transition-all duration-300">
          <div>
            <p className="text-on-surface-variant font-display text-label-sm mb-1 uppercase tracking-widest">Salinity Level</p>
            <h3 className="font-display text-h1 text-secondary">{latestLog?.tds_ppm ? `${latestLog.tds_ppm}` : "0"} <span className="text-h2">ppt</span></h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-fixed/50 text-secondary-container text-xs font-bold mt-2">
              <Droplets size={14} className="mr-1" /> {healthStatus.label.toLowerCase()}
            </span>
          </div>
          <div className="w-16 h-16 rounded-full bg-secondary/5 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-3xl">water_drop</span>
          </div>
        </div>

        {/* Device Health Card */}
        <div className="glass-panel rounded-xl p-md flex items-center justify-between ocean-glow transition-all duration-300">
          <div>
            <p className="text-on-surface-variant font-display text-label-sm mb-1 uppercase tracking-widest">Device Health</p>
            <h3 className={cn("font-display text-h1 uppercase", healthStatus.color)}>{healthStatus.label}</h3>
            <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold mt-2", healthStatus.bg, healthStatus.color)}>
              <ShieldCheck size={14} className="mr-1" /> operating
            </span>
          </div>
          <div className="w-16 h-16 rounded-full bg-tertiary/5 flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined text-3xl">health_and_safety</span>
          </div>
        </div>
      </section>

      {/* 2. MAIN DATA VISUALIZATIONS & ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* System Logs / Alerts */}
        <div className="lg:col-span-1">
          <div className="glass-panel rounded-xl p-6 h-full flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-h2 font-semibold text-on-surface">System Alerts</h3>
              <button className="text-primary font-display text-label-sm font-bold hover:underline uppercase tracking-widest">View All</button>
            </div>
            
            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar-hide pr-1">
              {notificationsLoading ? (
                <div className="flex items-center justify-center h-40 opacity-50">
                  <Activity size={20} className="animate-spin text-primary" />
                </div>
              ) : notifications.length === 0 ? (
                <p className="text-center text-label-sm text-outline py-10 italic">No active notifications.</p>
              ) : (
                notifications.slice(0, 5).map((alert) => (
                  <div key={alert.id} className={cn(
                    "flex gap-4 p-4 rounded-xl hover:bg-surface-container-low transition-colors border-l-4",
                    alert.type === "critical" ? "border-error bg-error/5" : "border-amber-500 bg-amber-50/50"
                  )}>
                    <span className={cn("material-symbols-outlined mt-1", alert.type === "critical" ? "text-error" : "text-amber-500")}>
                      {alert.type === "critical" ? "warning" : "error_outline"}
                    </span>
                    <div className="min-w-0">
                      <p className={cn("font-display text-body-md font-medium truncate", alert.type === "critical" ? "text-error" : "text-on-surface")}>
                        {alert.title}
                      </p>
                      <p className="text-xs text-on-surface-variant font-medium opacity-60">
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Voltage Performance Chart */}
        <div className="lg:col-span-2">
          <div className="glass-panel rounded-xl p-6 h-full min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-display text-h2 font-semibold text-on-surface">Voltage Performance</h3>
                <p className="text-on-surface-variant text-body-md font-body-md">24h Real-time History</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <span className="text-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Node Output</span>
              </div>
            </div>
            
            <div className="h-[300px]">
              {logsLoading ? (
                <div className="flex items-center justify-center h-full opacity-30">
                  <Activity size={40} className="animate-spin" />
                </div>
              ) : (
                <DeviceAnalyticsChart data={voltageChartData} metricConfig={METRIC_CONFIG[METRICS.VOLTAGE]} />
              )}
            </div>
          </div>
        </div>

        {/* Salinity Performance (Wave/Full Width Chart) */}
        <div className="lg:col-span-3">
          <div className="glass-panel rounded-xl p-6 h-full min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-display text-h2 font-semibold text-on-surface">Salinity Fluctuations</h3>
                <p className="text-on-surface-variant text-body-md font-body-md">Weekly Trend Analysis</p>
              </div>
              <div className="px-4 py-2 bg-secondary/5 rounded-full text-secondary font-display text-label-sm border border-secondary/20 font-bold uppercase tracking-widest">
                AVG: {latestLog?.tds_ppm || "0"} ppt
              </div>
            </div>
            
            <div className="h-[300px]">
              {logsLoading ? (
                <div className="flex items-center justify-center h-full opacity-30">
                  <Activity size={40} className="animate-spin" />
                </div>
              ) : (
                <DeviceAnalyticsChart data={salinityChartData} metricConfig={METRIC_CONFIG[METRICS.TDS]} />
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ResidentDashboard;
