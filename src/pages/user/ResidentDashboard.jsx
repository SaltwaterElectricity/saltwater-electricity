import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Router } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import {
  useDevices,
  useResidentHistory,
  useNotifications,
  useDeviceRequests,
  useAssignments,
} from "../../hooks";
import {
  WelcomeSection,
  TotalDevicesCard,
  RequestDeviceCard,
  DeviceHealthCard,
  PerformanceAnalyticsCard,
  SystemOverviewCard,
  ResidentDeviceStatusWidget,
  RecentAlertsFeed,
} from "../../components";
import { METRICS, SENSOR_CONFIG, ROUTES } from "../../constants";
import { Footer } from "../../layout";

/**
 * ResidentDashboard Component
 * High-fidelity personal monitoring hub for residents.
 * Orchestrates data fetching and passes it to specialized sub-components.
 */
const ResidentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { devices, telemetry, loading: devicesLoading } = useDevices();
  const { assignments, loading: assignmentsLoading } = useAssignments();
  const { requests, loading: requestsLoading } = useDeviceRequests(user?.uid);

  // Date Filtering State: Default to today (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Find all devices assigned to the current resident
  // We check both the primary 'device_assignments' node and the legacy 'assigned_user_id' field
  const userDevices = useMemo(() => {
    if (!user || !devices) return [];

    const userId = String(user.uid || user.id || "");
    if (!userId) return [];

    // 1. Identify IDs from primary assignment node
    const assignedIds = assignments
      ? Object.entries(assignments)
          .filter(([_, data]) => String(data.userId) === userId)
          .map(([id]) => id)
      : [];

    // 2. Filter devices that either have the direct ID match or the legacy field match
    return devices.filter((d) => {
      const isPrimaryMatch = assignedIds.includes(d.device_id);
      const isLegacyMatch = String(d.assigned_user_id || "") === userId;
      return isPrimaryMatch || isLegacyMatch;
    });
  }, [user, devices, assignments]);

  // Primary device for status widgets (usually the first one)
  const primaryDevice = userDevices.length > 0 ? userDevices[0] : null;
  const deviceIds = useMemo(() => userDevices.map((d) => d.device_id), [userDevices]);

  // Fetch Logs (Merged from all assigned devices) and Notifications
  const { logs, loading: logsLoading } = useResidentHistory(deviceIds, 50, selectedDate);
  const { notifications, loading: notificationsLoading } = useNotifications(user?.uid);

  // Latest entry for calculations: Priority to real-time telemetry, fallback to logs
  const latestLog = useMemo(() => {
    if (primaryDevice && telemetry && telemetry[primaryDevice.device_id]) {
      return telemetry[primaryDevice.device_id];
    }
    return logs && logs.length > 0 ? logs[0] : null;
  }, [primaryDevice, telemetry, logs]);

  // KPI Calculations
  const totalDevicesCount = userDevices.length;
  const pendingRequests = useMemo(
    () => requests.filter((r) => r.status === "pending").length,
    [requests]
  );

  const healthScore = useMemo(() => {
    if (!latestLog) return 0;
    const tds = latestLog.tds_ppm || 0;
    const config = SENSOR_CONFIG[METRICS.TDS];
    if (tds < config.warning) return 98;
    if (tds < config.critical) return 85;
    return 45;
  }, [latestLog]);

  // Chart Data Processing: Aggregated from all assigned devices
  const performanceChartData = useMemo(() => {
    // Combine logs with the latest real-time telemetry point
    const allLogs = [...(logs || [])];
    if (
      latestLog &&
      !allLogs.find(
        (l) =>
          (l.__normalizedTs || l.timestamp) === (latestLog.__normalizedTs || latestLog.timestamp)
      )
    ) {
      allLogs.push(latestLog);
    }

    if (allLogs.length === 0) return [];

    const vConfig = SENSOR_CONFIG[METRICS.VOLTAGE];
    const cConfig = SENSOR_CONFIG[METRICS.CURRENT];
    const sConfig = SENSOR_CONFIG[METRICS.TDS];

    // Group logs by time bucket (e.g., 30-minute intervals) to handle multiple devices at similar times
    const BUCKET_SIZE = 30 * 60 * 1000; // 30 minutes
    const buckets = new Map();

    allLogs.forEach((log) => {
      const ts = log.__normalizedTs || log.timestamp;
      const bucketTs = Math.floor(ts / BUCKET_SIZE) * BUCKET_SIZE;

      if (!buckets.has(bucketTs)) {
        buckets.set(bucketTs, {
          v: [],
          c: [],
          s: [],
          timestamp: bucketTs,
        });
      }

      const b = buckets.get(bucketTs);
      // Ensure zero values are accepted (not ignored)
      const v = typeof log.voltage === "number" ? log.voltage : parseFloat(log.voltage);
      const c = typeof log.current === "number" ? log.current : parseFloat(log.current);
      const s = typeof log.tds_ppm === "number" ? log.tds_ppm : parseFloat(log.tds_ppm);

      if (!isNaN(v)) b.v.push(v);
      if (!isNaN(c)) b.c.push(c);
      if (!isNaN(s)) b.s.push(s);
    });

    return Array.from(buckets.values())
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-24) // Show last 24 buckets
      .map((b) => {
        // Average values in bucket
        const avgV = b.v.length > 0 ? b.v.reduce((sum, val) => sum + val, 0) / b.v.length : 0;
        const avgC = b.c.length > 0 ? b.c.reduce((sum, val) => sum + val, 0) / b.c.length : 0;
        const avgS = b.s.length > 0 ? b.s.reduce((sum, val) => sum + val, 0) / b.s.length : 0;

        return {
          timestamp: b.timestamp,
          timeLabel: new Date(b.timestamp).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          voltageNormalized: Math.min((avgV / (vConfig.max || 15)) * 100, 100),
          currentNormalized: Math.min((avgC / (cConfig.max || 5)) * 100, 100),
          salinityNormalized: Math.min((avgS / (sConfig.max || 1000)) * 100, 100),
          voltage: avgV.toFixed(2),
          current: avgC.toFixed(2),
          salinity: avgS.toFixed(0),
        };
      });
  }, [logs, latestLog]);

  if (devicesLoading || requestsLoading || assignmentsLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-label-sm font-semibold text-outline uppercase tracking-widest mt-4 animate-pulse font-label-sm">
          Syncing Facility Data...
        </p>
      </div>
    );
  }

  if (userDevices.length === 0 && pendingRequests === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center px-6">
        <div className="max-w-md p-12 glass-card rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-500">
          <div className="w-20 h-20 primary-gradient rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg">
            <Router size={40} />
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
      <WelcomeSection firstName={user?.firstName} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <TotalDevicesCard value={totalDevicesCount} />
        <RequestDeviceCard value={pendingRequests} />
        <DeviceHealthCard value={healthScore} trendValue="8%" trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        <PerformanceAnalyticsCard
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          logsLoading={logsLoading}
          logs={logs}
          performanceChartData={performanceChartData}
          deviceIds={deviceIds}
        />

        <SystemOverviewCard
          healthScore={healthScore}
          totalDevices={totalDevicesCount}
          activeDevices={totalDevicesCount}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <ResidentDeviceStatusWidget
          userDevices={userDevices}
          telemetry={telemetry}
          onViewAll={() => navigate(ROUTES.SMART_AQUA_MONITOR)}
        />

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
