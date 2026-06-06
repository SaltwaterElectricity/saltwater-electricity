import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAuditLogs,
  useDeviceRequests,
  useDevices,
  useMultiDeviceHistory,
  useResidentManagement,
} from "../../hooks";
import {
  AnalyticsChart,
  SystemHealthGauge,
  DeviceFeatureBarChart,
  DeviceUsersTable,
  TotalDevicesAdminCard,
  OnlineDevicesCard,
  OfflineDevicesCard,
  SystemHealthCard,
  RecentAlertsFeed,
} from "../../components";
import { ROUTES } from "../../constants/routes";
import { SENSOR_CONFIG, METRICS } from "../../constants";

/**
 * MAIN ADMIN DASHBOARD PAGE
 * Synchronized with dashboard.html main content.
 */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { residents, loading: residentsLoading } = useResidentManagement();
  const { logs: auditLogs, loading: auditLoading } = useAuditLogs(10);
  const { requests } = useDeviceRequests();
  const { devices, telemetry } = useDevices();

  // Use a stable 'now' for the duration of a render cycle
  const [now] = useState(() => Date.now());
  const onlineThreshold = 300000; // 5 minutes

  // Aggregated Stats Calculation
  const stats = useMemo(() => {
    const total = devices.length;
    let onlineCount = 0;
    let sumV = 0,
      sumS = 0,
      sumC = 0;

    devices.forEach((d) => {
      const tel = telemetry[d.device_id];
      const isOnline = tel && tel.timestamp && now - tel.timestamp < onlineThreshold;

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
      // Averages (Normalized 0-100) for Gauge
      avgV: onlineCount > 0 ? Math.min((sumV / onlineCount / (vConfig.max || 15)) * 100, 100) : 0,
      avgS: onlineCount > 0 ? Math.min((sumS / onlineCount / (sConfig.max || 1000)) * 100, 100) : 0,
      avgC: onlineCount > 0 ? Math.min((sumC / onlineCount / (cConfig.max || 5)) * 100, 100) : 0,
    };
  }, [devices, telemetry, now]);

  // CONFIGURATION: Multi-Device Comparison Setup
  const comparisonConfig = useMemo(() => {
    const COLORS = ["#004ac6", "#00A3C4", "#8E44AD", "#F39C12", "#27AE60"];
    return devices.slice(0, 3).map((d, index) => ({
      id: d.device_id,
      name: d.device_name || `Unit ${d.device_id.substring(0, 4)}`,
      color: COLORS[index % COLORS.length],
    }));
  }, [devices]);

  const comparisonDeviceIds = useMemo(() => comparisonConfig.map((c) => c.id), [comparisonConfig]);
  const { data: multiHistoryData } = useMultiDeviceHistory(comparisonDeviceIds, 20);

  // Normalized Feature Data for Bar Chart
  const deviceFeatureData = useMemo(() => {
    const vConfig = SENSOR_CONFIG[METRICS.VOLTAGE];
    const sConfig = SENSOR_CONFIG[METRICS.TDS];
    const cConfig = SENSOR_CONFIG[METRICS.CURRENT];

    return devices.slice(0, 4).map((d) => {
      const tel = telemetry[d.device_id] || {};
      return {
        name: d.device_name?.split(" ")[0] || d.device_id.substring(0, 6),
        voltage: Math.min((tel.voltage / (vConfig.max || 15)) * 100, 100) || 0,
        salinity: Math.min((tel.tds / (sConfig.max || 1000)) * 100, 100) || 0,
        current: Math.min((tel.current / (cConfig.max || 5)) * 100, 100) || 0,
      };
    });
  }, [devices, telemetry]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* 1. METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TotalDevicesAdminCard value={stats.total || 0} trendValue="12%" trend="up" />
        <OnlineDevicesCard value={stats.online || 0} trendValue="+2" trend="up" />
        <OfflineDevicesCard value={stats.offline || 0} trendValue="-1" trend="down" />
        <SystemHealthCard value={stats.health} status={stats.health > 80 ? "Optimal" : "Checkup"} />
      </div>

      {/* 2. PERFORMANCE & HEALTH SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-9">
          <AnalyticsChart data={multiHistoryData} devices={comparisonConfig} />
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
            alerts={auditLogs}
            loading={auditLoading}
            onViewAll={() => navigate(ROUTES.ADMIN_AUDIT_LOGS)}
          />

          <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col">
            <h3 className="font-bold text-sm uppercase tracking-wider text-on-surface-variant mb-6 text-center">
              DEVICE REQUEST
            </h3>
            <div className="space-y-6 flex-1">
              {requests
                ?.filter((r) => r.status === "pending")
                .slice(0, 2)
                .map((req) => (
                  <div key={req.id} className="border border-outline-variant/30 rounded-xl p-4">
                    <div className="text-center mb-4">
                      <p className="text-base font-bold text-on-surface">{req.deviceName}</p>
                      <p className="text-[11px] text-outline mt-1 font-medium uppercase tracking-widest">
                        {new Date(req.createdAt).toLocaleDateString()} •{" "}
                        {new Date(req.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => navigate(ROUTES.ADMIN_REQUEST_MANAGEMENT)}
                        className="py-2.5 px-4 text-primary font-bold text-[11px] border border-primary/20 rounded-lg hover:bg-primary/5 transition-all"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => navigate(ROUTES.ADMIN_REQUEST_MANAGEMENT)}
                        className="py-2.5 px-4 bg-primary text-white font-bold text-[11px] rounded-lg shadow-sm hover:brightness-110 transition-all"
                      >
                        Request Review
                      </button>
                    </div>
                  </div>
                ))}
              {requests?.filter((r) => r.status === "pending").length === 0 && (
                <p className="text-center py-10 text-[11px] font-bold text-outline uppercase tracking-widest">
                  No pending requests
                </p>
              )}
            </div>
            <div className="mt-6">
              <button
                onClick={() => navigate(ROUTES.ADMIN_REQUEST_MANAGEMENT)}
                className="w-full text-primary font-bold text-xs flex items-center justify-center gap-2 py-3 border border-primary/10 bg-primary/5 rounded-lg hover:bg-primary/10 transition-all"
              >
                View all requests{" "}
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Feature Data & Table */}
        <div className="lg:col-span-8 space-y-6">
          <DeviceFeatureBarChart data={deviceFeatureData} />
          <DeviceUsersTable
            users={residents?.filter((r) => r.deviceId).slice(0, 3) || []}
            loading={residentsLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
