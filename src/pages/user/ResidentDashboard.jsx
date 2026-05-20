import { useMemo } from "react";
import { useAuth } from "../../context/useAuth";
import { useDevices, useHistory, useNotifications, useDeviceRequests } from "../../hooks";
import { DeviceAnalyticsChart } from "../../components";
import { processLogsInWindows } from "../../utils/chartUtils";
import { METRICS, METRIC_CONFIG, SENSOR_CONFIG } from "../../constants";
import { cn } from "../../utils/cn";
import { Footer } from "../../layout";

/**
 * ResidentDashboard Component
 * High-fidelity personal monitoring hub for residents.
 * Aligned with user-dashboard.html design and layout.
 */
const ResidentDashboard = () => {
  const { user } = useAuth();
  const { devices, loading: devicesLoading } = useDevices();
  const { requests, loading: requestsLoading } = useDeviceRequests(user?.uid);

  // Find the device assigned to the current resident
  const userDevice = useMemo(() => {
    if (!user || !devices) return null;
    return devices.find((d) => d.assigned_user_id === user.uid || d.assigned_user_id === user.id);
  }, [user, devices]);

  const deviceId = userDevice?.device_id;

  // Fetch Logs and Notifications
  const { logs, loading: logsLoading } = useHistory(deviceId);
  const { notifications, loading: notificationsLoading } = useNotifications(user?.uid);

  // Latest entry for calculations
  const latestLog = useMemo(() => (logs && logs.length > 0 ? logs[0] : null), [logs]);

  // KPI Calculations
  const totalDevices = userDevice ? 1 : 0;
  const pendingRequests = useMemo(() => 
    requests.filter(r => r.status === "pending").length, 
  [requests]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const healthScore = useMemo(() => {
    if (!latestLog) return 0;
    const tds = latestLog.tds_ppm || 0;
    const config = SENSOR_CONFIG[METRICS.TDS];
    if (tds < config.warning) return 98;
    if (tds < config.critical) return 85;
    return 45;
  }, [latestLog]);

  // Chart Data Processing
  const voltageChartData = useMemo(() => {
    if (!logs || logs.length === 0) return [];
    return processLogsInWindows(logs, {
      metricKey: "voltage",
      metricId: METRICS.VOLTAGE,
    }).current;
  }, [logs]);

  if (devicesLoading || requestsLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-label-sm font-semibold text-outline uppercase tracking-widest mt-4 animate-pulse font-label-sm">
          Syncing Facility Data...
        </p>
      </div>
    );
  }

  if (!userDevice && totalDevices === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center px-6">
        <div className="max-w-md p-12 glass-card rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-500">
          <div className="w-20 h-20 primary-gradient rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg">
            <span className="material-symbols-outlined text-4xl">router</span>
          </div>
          <h2 className="text-h2 font-h2 font-bold text-primary tracking-tight">
            No Active Node
          </h2>
          <p className="text-body-md text-on-surface-variant mt-4 leading-relaxed font-body-md">
            Your account doesn&apos;t have an assigned monitoring unit yet. Contact the facility
            administrator to provision your hardware or submit a device request.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 space-y-stack-lg antialiased text-on-surface max-w-[1440px] mx-auto">
      
      {/* 1. WELCOME SECTION */}
      <section className="mb-stack-lg">
        <h3 className="text-h2 font-bold text-on-surface">
          {greeting}, {user?.firstName || "Resident"}!
        </h3>
        <p className="text-body-lg text-on-surface-variant mt-1 font-body-lg">
          Here’s what’s happening with your saltwater electricity system today.
        </p>
      </section>

      {/* 2. KPI SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {/* Total Devices */}
        <div className="bg-white rounded-2xl p-6 flex items-center shadow-[0_12px_32px_4px_rgba(10,46,255,0.04)] border border-[#e4e7ec80]">
          <div className="flex-shrink-0 w-16 h-16 rounded-full primary-gradient flex items-center justify-center text-white mr-6 shadow-lg">
            <span className="material-symbols-outlined text-[32px]">router</span>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Total Devices</p>
            <p className="flex items-center gap-1.5 text-green-600 text-[12px] font-semibold mb-2 font-body-md">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Active
            </p>
            <h4 className="text-4xl font-extrabold text-on-surface leading-none font-display">{totalDevices}</h4>
          </div>
        </div>

        {/* Request Device */}
        <div className="bg-white rounded-2xl p-6 flex items-center shadow-[0_12px_32px_4px_rgba(10,46,255,0.04)] border border-[#e4e7ec80]">
          <div className="flex-shrink-0 w-16 h-16 rounded-full primary-gradient flex items-center justify-center text-white mr-6 shadow-lg">
            <span className="material-symbols-outlined text-[32px]">event_note</span>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Request Device</p>
            <p className="flex items-center gap-1.5 text-orange-500 text-[12px] font-semibold mb-2 font-body-md">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              Pending
            </p>
            <h4 className="text-4xl font-extrabold text-on-surface leading-none font-display">{pendingRequests}</h4>
          </div>
        </div>

        {/* Device Health */}
        <div className="bg-white rounded-2xl p-6 flex items-center shadow-[0_12px_32px_4px_rgba(10,46,255,0.04)] border border-[#e4e7ec80]">
          <div className="flex-shrink-0 w-16 h-16 rounded-full primary-gradient flex items-center justify-center text-white mr-6 shadow-lg">
            <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Device Health</p>
            <h4 className="text-4xl font-extrabold text-on-surface leading-none mb-1 font-display">{healthScore}%</h4>
            <p className="flex items-center gap-1 text-green-600 text-[12px] font-semibold font-body-md">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              + 8%
            </p>
          </div>
        </div>
      </div>

      {/* 3. ANALYTICS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        {/* Device Performance Chart */}
        <div className="glass-card rounded-2xl p-6 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h5 className="text-[12px] font-bold text-on-surface tracking-tight uppercase">Device Performance</h5>
            <div className="flex items-center gap-2 px-3 py-2 border border-outline-variant/30 rounded-lg bg-white/50 shadow-sm">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">calendar_today</span>
              <span className="text-label-sm text-on-surface font-semibold">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
          <div className="flex-1 relative">
            {logsLoading ? (
              <div className="flex items-center justify-center h-full opacity-30">
                <span className="material-symbols-outlined animate-spin text-4xl">sync</span>
              </div>
            ) : (
              <DeviceAnalyticsChart
                data={voltageChartData}
                metricConfig={METRIC_CONFIG[METRICS.VOLTAGE]}
              />
            )}
          </div>
          {/* Stylized Legend */}
          <div className="flex items-center justify-center gap-6 pt-4 mt-auto">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider">Voltage (V)</span>
            </div>
            <div className="flex items-center gap-2 opacity-50">
              <div className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider">Salinity (ppt)</span>
            </div>
          </div>
        </div>

        {/* System Overview Donut Chart */}
        <div className="glass-card rounded-2xl p-6 flex flex-col h-[400px]">
          <h5 className="text-[12px] font-bold text-on-surface tracking-tight uppercase mb-6">System Overview</h5>
          <div className="flex-1 flex items-center justify-center relative">
            <svg className="w-64 h-64 -rotate-90">
              <circle cx="128" cy="128" fill="transparent" r="100" stroke="#E4E7EC" strokeWidth="16" />
              <circle 
                cx="128" cy="128" fill="transparent" r="100" stroke="url(#blueGrad)" 
                strokeDasharray="628" strokeDashoffset={628 * (1 - healthScore/100)} 
                strokeLinecap="round" strokeWidth="20"
                className="transition-all duration-1000 ease-out"
               />
              <defs>
                <linearGradient id="blueGrad" x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" style={{ stopColor: "#0A2EFF", stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: "#3D73FF", stopOpacity: 1 }} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <div className="w-12 h-12 rounded-full primary-gradient flex items-center justify-center text-white mb-2 shadow-lg">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              </div>
              <span className="text-h1 font-extrabold text-on-surface font-display">{healthScore}%</span>
              <span className="text-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Health</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-outline-variant/20">
            <div className="text-center">
              <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Efficiency</p>
              <p className="text-body-md font-bold text-green-600">92%</p>
            </div>
            <div className="text-center border-x border-outline-variant/20">
              <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">System Load</p>
              <p className="text-body-md font-bold text-primary">24%</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Active</p>
              <p className="text-body-md font-bold text-on-surface">{totalDevices}/1</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM WIDGETS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {/* Widget 1: Device Status Card */}
        <div className="glass-card rounded-2xl p-6 flex flex-col hover:border-primary/30 transition-all duration-300 group">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[14px] font-bold text-on-surface tracking-tight uppercase">Device - {userDevice?.device_name || "Unknown"}</span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 text-[12px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Active
            </div>
          </div>
          <div className="space-y-3 mb-6">
            {/* Voltage Row */}
            <div className="flex items-center justify-between p-3 rounded-2xl border border-outline-variant/10 bg-surface-bright/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                </div>
                <span className="text-label-md text-on-surface-variant font-medium font-body-md">Voltage</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-on-surface font-display">{latestLog?.voltage || "0.00"} V</span>
                <span className="text-[11px] font-bold text-green-600 uppercase tracking-tight">Normal</span>
              </div>
            </div>
            {/* Salinity Row */}
            <div className="flex items-center justify-between p-3 rounded-2xl border border-outline-variant/10 bg-surface-bright/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[20px]">water_drop</span>
                </div>
                <span className="text-label-md text-on-surface-variant font-medium font-body-md">Salinity</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-on-surface font-display">{latestLog?.tds_ppm || "0"} ppt</span>
                <span className="text-[11px] font-bold text-green-600 uppercase tracking-tight">Normal</span>
              </div>
            </div>
          </div>
          <button className="w-full py-3.5 primary-gradient rounded-xl text-label-md font-bold text-white shadow-lg mt-auto transition-all duration-300 hover:scale-[1.02] hover:brightness-110">
            View Real-Time
          </button>
        </div>

        {/* Widget 2: System Logs */}
        <div className="glass-card rounded-2xl p-6 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h5 className="text-[12px] font-bold text-on-surface-variant uppercase tracking-tight">System Logs</h5>
            <button className="text-primary text-[11px] font-bold px-3 py-1 border border-outline-variant/30 rounded-lg bg-white/50 shadow-sm hover:bg-surface-container-low transition-colors uppercase tracking-widest">
              View All
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {logsLoading ? (
               <div className="flex items-center justify-center h-40 opacity-30">
                 <span className="material-symbols-outlined animate-spin">sync</span>
               </div>
            ) : logs.length === 0 ? (
              <p className="text-center text-label-sm text-outline py-10 italic">No logs found.</p>
            ) : (
              logs.slice(0, 5).map((log) => (
                <div key={log.timestamp} className="flex items-center gap-4 py-3 border-b border-dotted border-outline-variant/30 last:border-0">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                    log.voltage > 0 ? "bg-green-50 text-green-500" : "bg-error/5 text-error"
                  )}>
                    <span className="material-symbols-outlined text-[20px]">power_settings_new</span>
                  </div>
                  <div>
                    <p className="text-label-md font-bold text-on-surface leading-tight">Device Status: {log.voltage > 0 ? 'ON' : 'OFF'}</p>
                    <p className="text-[11px] text-on-surface-variant font-medium mt-1 uppercase tracking-tight">
                      {new Date(log.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Widget 3: Recent Alerts */}
        <div className="glass-card rounded-2xl p-6 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h5 className="text-[12px] font-bold text-on-surface-variant tracking-tight uppercase">Recent Alerts</h5>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {notificationsLoading ? (
               <div className="flex items-center justify-center h-40 opacity-30">
                 <span className="material-symbols-outlined animate-spin">sync</span>
               </div>
            ) : notifications.length === 0 ? (
              <p className="text-center text-label-sm text-outline py-10 italic font-body-md">No active alerts.</p>
            ) : (
              notifications.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center gap-4 py-3 border-b border-dashed border-outline-variant/20 last:border-0">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                    alert.type === "critical" ? "bg-error/10 text-error" : "bg-amber-50 text-amber-500"
                  )}>
                    <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: alert.type === "critical" ? "'FILL' 1" : "'FILL' 0" }}>
                      {alert.type === "critical" ? "warning" : "info"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-on-surface leading-tight mb-1 truncate">{alert.title}</p>
                    <p className="text-[11px] text-on-surface-variant font-medium uppercase tracking-tight">
                      {new Date(alert.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-auto pt-4 border-t border-outline-variant/10">
            <button className="flex items-center gap-2 text-primary font-bold text-[14px] hover:underline uppercase tracking-widest">
              See All Alerts
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ResidentDashboard;
