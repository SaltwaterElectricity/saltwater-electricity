import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import {
  useAuditLogs,
  useDeviceRequests,
  useDevices,
  useMultiDeviceHistory,
  useResidentManagement,
  useNotifications,
} from "../../hooks";
import AnalyticsChart from "../../components/admin/dashboard/AnalyticsChart";
import SystemHealthGauge from "../../components/admin/dashboard/SystemHealthGauge";
import DeviceFeatureBarChart from "../../components/admin/dashboard/DeviceFeatureBarChart";
import DeviceUsersTable from "../../components/admin/dashboard/DeviceUsersTable";
import TotalDevicesAdminCard from "../../components/admin/dashboard/TotalDevicesAdminCard";
import OnlineDevicesCard from "../../components/admin/dashboard/OnlineDevicesCard";
import OfflineDevicesCard from "../../components/admin/dashboard/OfflineDevicesCard";
import SystemHealthCard from "../../components/admin/dashboard/SystemHealthCard";
import { RecentAlertsFeed } from "../../components/dashboard";
import DeviceRequestWidget from "../../components/admin/dashboard/DeviceRequestWidget";
import { AdminDashboardSkeleton } from "../../components/skeleton";
import { ROUTES } from "../../constants/routes";
import { SENSOR_CONFIG, METRICS, APP_SETTINGS } from "../../constants";

/**
 * MAIN ADMIN DASHBOARD PAGE
 * Synchronized with dashboard.html main content.
 */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, isSuperAdmin } = useAuth();
  const { residents, filters, loading: residentsLoading } = useResidentManagement();
  const { loading: auditLoading } = useAuditLogs(10);
  const { requests } = useDeviceRequests();
  const { devices, telemetry, loading: devicesLoading } = useDevices();

  // Integrated Notification Feed (Limited to 5 for widget)
  const notificationScope = isAdmin || isSuperAdmin ? "all" : "admin";
  const { notifications, loading: notificationsLoading } = useNotifications(notificationScope, 5);

  // 1. DATE SELECTION STATE: Default to 'null' for Recent Analysis (Last 50 logs)
  const [selectedDate, setSelectedDate] = useState(null);

  // Use a stable 'now' for the duration of a render cycle
  const [now] = useState(() => Date.now());
  const onlineThreshold = APP_SETTINGS.STALE_THRESHOLD || 30000;

  // Aggregated Stats Calculation
  const stats = useMemo(() => {
    const total = devices.length;
    let onlineCount = 0;
    let sumV = 0,
      sumS = 0,
      sumC = 0;

    devices.forEach((d) => {
      const tel = telemetry[d.device_id];
      // IDOR/STALE DEFENSE: Only count as online if data is fresh per APP_SETTINGS
      const isOnline =
        tel && tel.timestamp && now - tel.timestamp < onlineThreshold && !tel.isFallback;

      if (isOnline) {
        onlineCount++;
        sumV += tel.voltage || 0;
        sumS += tel.tds || 0;
        sumC += tel.current || 0;
      }
    });

    const vConfig = SENSOR_CONFIG[METRICS.VOLTAGE];
    const sConfig = SENSOR_CONFIG[METRICS.TDS];
    const cConfig = SENSOR_CONFIG[METRICS.CURRENT];

    return {
      total,
      online: onlineCount,
      offline: total - onlineCount,
      health: total > 0 ? Math.round((onlineCount / total) * 100) : 0,
      // Averages (Normalized 0-100) for Gauge - Uses basis data from SENSOR_CONFIG
      avgV: onlineCount > 0 ? Math.min((sumV / onlineCount / (vConfig.max || 300)) * 100, 100) : 0,
      avgS: onlineCount > 0 ? Math.min((sumS / onlineCount / (sConfig.max || 1000)) * 100, 100) : 0,
      avgC: onlineCount > 0 ? Math.min((sumC / onlineCount / (cConfig.max || 5)) * 100, 100) : 0,
    };
  }, [devices, telemetry, now, onlineThreshold]);

  // CONFIGURATION: Multi-Device Comparison Setup
  // Priority: 1. Active units with data, 2. Most recently added units
  const comparisonConfig = useMemo(() => {
    const COLORS = ["#004ac6", "#00A3C4", "#8E44AD", "#F39C12", "#27AE60"];

    // Sort devices by telemetry timestamp (freshness) to prioritize active ones in the comparison
    const sortedDevices = [...devices].sort((a, b) => {
      const tsA = telemetry[a.device_id]?.timestamp || 0;
      const tsB = telemetry[b.device_id]?.timestamp || 0;
      return tsB - tsA;
    });

    return sortedDevices.slice(0, 3).map((d, index) => ({
      id: d.device_id,
      name: d.device_name || `Unit ${d.device_id.substring(0, 4)}`,
      color: COLORS[index % COLORS.length],
    }));
  }, [devices, telemetry]);

  const comparisonDeviceIds = useMemo(
    () => (comparisonConfig.length > 0 ? comparisonConfig.map((c) => c.id) : []),
    [comparisonConfig]
  );
  const { data: multiHistoryData, loading: historyLoading } = useMultiDeviceHistory(
    comparisonDeviceIds,
    100,
    selectedDate
  );

  // Normalized Feature Data for Bar Chart
  const deviceFeatureData = useMemo(() => {
    const vConfig = SENSOR_CONFIG[METRICS.VOLTAGE];
    const sConfig = SENSOR_CONFIG[METRICS.TDS];
    const cConfig = SENSOR_CONFIG[METRICS.CURRENT];

    return devices.slice(0, 4).map((d) => {
      const tel = telemetry[d.device_id] || {};
      const name = d.device_name || `Unit ${d.device_id.substring(0, 4)}`;
      return {
        name: name.length > 12 ? name.substring(0, 10) + ".." : name,
        voltage: Math.min((tel.voltage / (vConfig.max || 300)) * 100, 100) || 0,
        salinity: Math.min((tel.tds / (sConfig.max || 1000)) * 100, 100) || 0,
        current: Math.min((tel.current / (cConfig.max || 5)) * 100, 100) || 0,
      };
    });
  }, [devices, telemetry]);

  if (residentsLoading || auditLoading || devicesLoading || historyLoading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* 1. METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TotalDevicesAdminCard value={stats.total || 0} trendValue="Live" trend="up" />
        <OnlineDevicesCard value={stats.online || 0} trendValue="Live" trend="up" />
        <OfflineDevicesCard value={stats.offline || 0} trendValue="Live" trend="down" />
        <SystemHealthCard value={stats.health} status={stats.health > 80 ? "Optimal" : "Checkup"} />
      </div>

      {/* 2. PERFORMANCE & HEALTH SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-9">
          <AnalyticsChart
            data={multiHistoryData}
            devices={comparisonConfig}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            loading={historyLoading}
          />
        </div>
        <div className="lg:col-span-3">
          <SystemHealthGauge
            voltage={stats.avgV}
            salinity={stats.avgS}
            current={stats.avgC}
            overall={stats.health}
          />
        </div>
      </div>

      {/* 3. ALERTS & USERS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Alerts & Requests */}
        <div className="lg:col-span-4 space-y-6">
          <RecentAlertsFeed
            title="System Alerts"
            variant="widget"
            alerts={notifications}
            loading={notificationsLoading}
            onViewAll={() => navigate(ROUTES.ALERTS)}
          />

          <DeviceRequestWidget requests={requests} />
        </div>

        {/* Right Column: Feature Data & Table */}
        <div className="lg:col-span-8 space-y-6">
          <DeviceFeatureBarChart data={deviceFeatureData} loading={devicesLoading} />
          <DeviceUsersTable
            users={residents?.filter((r) => r.deviceId).slice(0, 3) || []}
            loading={residentsLoading}
            searchTerm={filters.searchTerm}
            setSearchTerm={filters.setSearchTerm}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
