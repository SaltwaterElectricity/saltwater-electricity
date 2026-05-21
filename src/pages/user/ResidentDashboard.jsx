import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useDevices, useHistory, useNotifications, useDeviceRequests } from "../../hooks";
import {
  DeviceAnalyticsChart,
  SummaryCard,
  RecentAlertsFeed,
  HealthDonutChart,
} from "../../components";
import { processLogsInWindows } from "../../utils/chartUtils";
import { METRICS, METRIC_CONFIG, SENSOR_CONFIG, ROUTES } from "../../constants";
import { Footer } from "../../layout";

/**
 * ResidentDashboard Component
 * High-fidelity personal monitoring hub for residents.
 * Aligned with user-dashboard.html design and layout.
 */
const ResidentDashboard = () => {
  const navigate = useNavigate();
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
  const pendingRequests = useMemo(
    () => requests.filter((r) => r.status === "pending").length,
    [requests]
  );

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
          <h2 className="text-h2 font-h2 font-bold text-primary tracking-tight">No Active Node</h2>
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
        <SummaryCard
          title="Total Devices"
          value={totalDevices}
          subtitle="Active"
          icon="router"
          colorClass="text-green-600"
        />

        <SummaryCard
          title="Request Device"
          value={pendingRequests}
          subtitle="Pending"
          icon="event_note"
          colorClass="text-orange-500"
        />

        <SummaryCard
          title="Device Health"
          value={`${healthScore}%`}
          icon="security"
          trend="up"
          trendValue="8%"
        />
      </div>

      {/* 3. ANALYTICS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        {/* Device Performance Chart */}
        <div className="glass-card rounded-2xl p-6 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h5 className="text-[12px] font-bold text-on-surface tracking-tight uppercase">
              Device Performance
            </h5>
            <div className="flex items-center gap-2 px-3 py-2 border border-outline-variant/30 rounded-lg bg-white/50 shadow-sm">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                calendar_today
              </span>
              <span className="text-label-sm text-on-surface font-semibold">
                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
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
              <span className="text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider">
                Voltage (V)
              </span>
            </div>
            <div className="flex items-center gap-2 opacity-50">
              <div className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider">
                Salinity (ppt)
              </span>
            </div>
          </div>
        </div>

        {/* System Overview Donut Chart */}
        <div className="glass-card rounded-2xl p-6 flex flex-col h-[400px]">
          <h5 className="text-[12px] font-bold text-on-surface tracking-tight uppercase mb-6">
            System Overview
          </h5>
          
          <HealthDonutChart 
            score={healthScore}
            title="Health"
            icon="bolt"
          />

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-outline-variant/20">
            <div className="text-center">
              <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">
                Efficiency
              </p>
              <p className="text-body-md font-bold text-green-600">92%</p>
            </div>
            <div className="text-center border-x border-outline-variant/20">
              <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">
                System Load
              </p>
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
            <span className="text-[14px] font-bold text-on-surface tracking-tight uppercase">
              Device - {userDevice?.device_name || "Unknown"}
            </span>
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
                <span className="text-label-md text-on-surface-variant font-medium font-body-md">
                  Voltage
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-on-surface font-display">
                  {latestLog?.voltage || "0.00"} V
                </span>
                <span className="text-[11px] font-bold text-green-600 uppercase tracking-tight">
                  Normal
                </span>
              </div>
            </div>
            {/* Salinity Row */}
            <div className="flex items-center justify-between p-3 rounded-2xl border border-outline-variant/10 bg-surface-bright/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[20px]">water_drop</span>
                </div>
                <span className="text-label-md text-on-surface-variant font-medium font-body-md">
                  Salinity
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-on-surface font-display">
                  {latestLog?.tds_ppm || "0"} ppt
                </span>
                <span className="text-[11px] font-bold text-green-600 uppercase tracking-tight">
                  Normal
                </span>
              </div>
            </div>
          </div>
          <button className="w-full py-3.5 primary-gradient rounded-xl text-label-md font-bold text-white shadow-lg mt-auto transition-all duration-300 hover:scale-[1.02] hover:brightness-110">
            View Real-Time
          </button>
        </div>

        {/* Widget 2: System Logs */}
        <RecentAlertsFeed 
          title="System Logs"
          variant="widget"
          alerts={logs?.slice(0, 5).map(log => ({
            timestamp: log.timestamp,
            title: `Device Status: ${log.voltage > 0 ? 'ON' : 'OFF'}`,
            details: log.voltage > 0 ? "Node output active" : "Node output inactive",
            type: log.voltage > 0 ? "info" : "warning"
          }))}
          loading={logsLoading}
        />

        {/* Widget 3: Recent Alerts */}
        <RecentAlertsFeed 
          title="Recent Alerts"
          variant="widget"
          alerts={notifications?.slice(0, 5)}
          loading={notificationsLoading}
          onViewAll={() => navigate(ROUTES.ALERTS)}
        />
      </div>

      <Footer />
    </div>
  );
};

export default ResidentDashboard;
