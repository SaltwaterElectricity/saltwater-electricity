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
  DashboardSkeleton,
} from "../../components";
import { RecentAlertsFeed } from "../../components/dashboard";

import { METRICS, SENSOR_CONFIG, ROUTES, APP_SETTINGS } from "../../constants";
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

  // Date Filtering State: Default to today (YYYY-MM-DD) in LOCAL time
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });

  // Find all devices assigned to the current resident
  const userDevices = useMemo(() => {
    if (!user || !devices) return [];

    const userId = String(user.uid || user.id || "");
    if (!userId) return [];

    const assignedIds = assignments
      ? Object.entries(assignments)
          .filter(([_, data]) => String(data.userId) === userId)
          .map(([id]) => id)
      : [];

    return devices.filter((d) => {
      const isPrimaryMatch = assignedIds.includes(d.device_id);
      const isLegacyMatch = String(d.assigned_user_id || "") === userId;
      return isPrimaryMatch || isLegacyMatch;
    });
  }, [user, devices, assignments]);

  const primaryDevice = userDevices.length > 0 ? userDevices[0] : null;
  const deviceIds = useMemo(() => userDevices.map((d) => d.device_id), [userDevices]);

  // Fetch Logs (Merged from all assigned devices) and Notifications
  const { logs, loading: logsLoading } = useResidentHistory(deviceIds, 50, selectedDate);
  const { notifications, loading: notificationsLoading } = useNotifications(user?.uid);

  /**
   * Helper: Extracts YYYY-MM-DD from a timestamp in LOCAL time.
   */
  const getLocalDateString = (ts) => {
    if (!ts) return null;
    // Robust parsing: convert to number to handle numeric strings, then verify validity
    const d = new Date(Number(ts));
    if (isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  // Latest entry for calculations: Priority to real-time telemetry (if date matches), fallback to logs
  const latestLog = useMemo(() => {
    const tel = primaryDevice && telemetry ? telemetry[primaryDevice.device_id] : null;

    // 1. Check if real-time telemetry matches the selected date (Local Time)
    // 🛡️ PHANTOM DEFENSE: Ignore local fallback standby objects
    if (tel && !tel.isFallback) {
      const telTs = tel.__normalizedTs || tel.timestamp;
      if (getLocalDateString(telTs) === selectedDate) {
        return tel;
      }
    }

    // 2. Otherwise, use the latest record from the historical logs IF it matches the day
    const logCandidate = logs && logs.length > 0 ? logs[0] : null;
    if (logCandidate) {
      const logTs = logCandidate.__normalizedTs || logCandidate.timestamp;
      if (getLocalDateString(logTs) === selectedDate) {
        return logCandidate;
      }
    }

    return null;
  }, [primaryDevice, telemetry, logs, selectedDate]);

  /**
   * Helper: Calculates a health percentage (0-100) based on TDS readings.
   */
  const calculateHealthScore = (log) => {
    if (!log) return 0;
    const tdsValue = log.tds ?? log.tds_ppm ?? 0;
    const config = SENSOR_CONFIG[METRICS.TDS];
    
    if (tdsValue <= config.warning) {
      const progress = tdsValue / config.warning;
      return Math.round(100 - progress * 15);
    } else if (tdsValue <= config.critical) {
      const range = config.critical - config.warning;
      const progress = (tdsValue - config.warning) / range;
      return Math.round(85 - progress * 45);
    }
    return Math.max(0, Math.round(40 - ((tdsValue - config.critical) / 500) * 40));
  };

  const healthScore = useMemo(() => calculateHealthScore(latestLog), [latestLog]);

  // Calculate Health Trend: Comparison with the previous recorded log
  const healthTrend = useMemo(() => {
    if (!logs || logs.length < 2) {
      return { 
        value: healthScore > 90 ? "Normal" : healthScore > 70 ? "Stable" : "Critical", 
        trend: healthScore > 70 ? "up" : "down" 
      };
    }

    const currentScore = healthScore;
    const prevScore = calculateHealthScore(logs[1]);
    const diff = currentScore - prevScore;

    if (diff === 0) return { value: "Stable", trend: "up" };
    
    return {
      value: `${Math.abs(diff)}%`,
      trend: diff > 0 ? "up" : "down"
    };
  }, [logs, healthScore]);

  // KPI Calculations
  const totalDevicesCount = userDevices.length;
  const pendingRequests = useMemo(
    () => requests.filter((r) => r.status === "pending").length,
    [requests]
  );

  const [mountTime] = useState(() => Date.now());

  const activeDevicesCount = useMemo(() => {
    return userDevices.filter((d) => {
      const tel = telemetry?.[d.device_id];
      // IDOR/STALE DEFENSE: Only count as active if voltage > 0 AND reading is relatively fresh
      const telTs = tel?.__normalizedTs || tel?.timestamp || 0;
      const isRecent = tel && (mountTime - telTs) < (APP_SETTINGS.STALE_THRESHOLD || 30000);
      return tel && tel.voltage > 0 && isRecent;
    }).length;
  }, [userDevices, telemetry, mountTime]);

  // Derived technical metrics for System Overview
  const { efficiency, systemLoad } = useMemo(() => {
    if (!latestLog) return { efficiency: 0, systemLoad: 0 };
    
    const v = Number(latestLog.voltage) || 0;
    const c = Number(latestLog.current) || 0;

    // Efficiency: Proximity to nominal 240V
    const effVal = Math.max(0, Math.min(100, (v / 240) * 100));
    // Load: Current draw relative to 5A capacity (as defined in reading.service.js context)
    const loadVal = Math.max(0, Math.min(100, (c / 5) * 100));

    return {
      efficiency: Math.round(effVal),
      systemLoad: Math.round(loadVal)
    };
  }, [latestLog]);

  // Chart Data Processing: Aggregated from all assigned devices
  const performanceChartData = useMemo(() => {
    // 🛡️ STALE DATA DEFENSE: Filter logs by selectedDate to ensure visual accuracy
    const filteredLogs = (logs || []).filter((l) => {
      const ts = l.__normalizedTs || l.timestamp;
      return getLocalDateString(ts) === selectedDate;
    });

    const allLogs = [...filteredLogs];
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

    const BUCKET_SIZE = 30 * 60 * 1000;
    const buckets = new Map();

    allLogs.forEach((log) => {
      const ts = log.__normalizedTs || log.timestamp;
      const bucketTs = Math.floor(ts / BUCKET_SIZE) * BUCKET_SIZE;

      if (!buckets.has(bucketTs)) {
        buckets.set(bucketTs, { v: [], c: [], s: [], timestamp: bucketTs });
      }

      const b = buckets.get(bucketTs);
      const v = Number(log.voltage) || 0;
      const c = Number(log.current) || 0;
      const s = Number(log.tds ?? log.tds_ppm) || 0;

      b.v.push(v);
      b.c.push(c);
      b.s.push(s);
    });

    return Array.from(buckets.values())
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-48) // Show up to a full day of buckets (30-min intervals)
      .map((b) => {
        const avgV = b.v.length > 0 ? b.v.reduce((sum, val) => sum + val, 0) / b.v.length : 0;
        const avgC = b.c.length > 0 ? b.c.reduce((sum, val) => sum + val, 0) / b.c.length : 0;
        const avgS = b.s.length > 0 ? b.s.reduce((sum, val) => sum + val, 0) / b.s.length : 0;

        const bucketDate = new Date(b.timestamp);

        return {
          timestamp: b.timestamp,
          timeLabel: bucketDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          dateLabel: bucketDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          voltageNormalized: Math.min((avgV / (vConfig.max || 300)) * 100, 100),
          currentNormalized: Math.min((avgC / (cConfig.max || 5)) * 100, 100),
          salinityNormalized: Math.min((avgS / (sConfig.max || 1000)) * 100, 100),
          voltage: avgV.toFixed(1),
          current: avgC.toFixed(2),
          salinity: avgS.toFixed(1),
        };
      });
  }, [logs, latestLog, selectedDate]);

  if (devicesLoading || requestsLoading || assignmentsLoading) {
    return <DashboardSkeleton />;
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
    <div className="animate-in fade-in duration-700 space-y-stack-lg antialiased text-on-surface">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
        <WelcomeSection firstName={user?.firstName} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 fill-mode-both">
        <TotalDevicesCard value={totalDevicesCount} />
        <RequestDeviceCard value={pendingRequests} />
        <DeviceHealthCard 
          value={healthScore} 
          trendValue={healthTrend.value} 
          trend={healthTrend.trend} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">
        <PerformanceAnalyticsCard
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          logsLoading={logsLoading}
          performanceChartData={performanceChartData}
          deviceIds={deviceIds}
        />

        <SystemOverviewCard
          healthScore={healthScore}
          totalDevices={totalDevicesCount}
          activeDevices={activeDevicesCount}
          efficiency={efficiency}
          systemLoad={systemLoad}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300 fill-mode-both">
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

      <div className="animate-in fade-in duration-1000 delay-500 fill-mode-both">
        <Footer />
      </div>
    </div>
  );
};

export default ResidentDashboard;
