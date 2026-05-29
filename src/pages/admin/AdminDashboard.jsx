import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useUserSubscription,
  useAuditLogs,
  useDeviceRequests,
  useDevices,
  useMultiDeviceHistory,
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

/**
 * MAIN ADMIN DASHBOARD PAGE
 * Synchronized with dashboard.html main content.
 */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data: users, loading: usersLoading } = useUserSubscription();
  const { logs: auditLogs, loading: auditLoading } = useAuditLogs(10);
  const { requests } = useDeviceRequests();
  const { devices, telemetry } = useDevices();

  // DATA CALCULATION: Real-time Device Stats
  const now = Date.now();
  const onlineThreshold = 300000; // 5 minutes

  const stats = useMemo(() => {
    const total = devices.length;
    let online = 0;

    devices.forEach((d) => {
      const tel = telemetry[d.device_id];
      if (tel && tel.timestamp && now - tel.timestamp < onlineThreshold) {
        online++;
      }
    });

    return {
      total,
      online,
      offline: total - online,
      health: total > 0 ? Math.round((online / total) * 100) : 0,
    };
  }, [devices, telemetry, now]);

  // CONFIGURATION: Multi-Device Comparison Setup
  const comparisonConfig = useMemo(() => {
    // Select top 3 devices for comparison
    const COLORS = ["#004ac6", "#00A3C4", "#8E44AD", "#F39C12", "#27AE60"];
    return devices.slice(0, 3).map((d, index) => ({
      id: d.device_id,
      name: d.device_name || `Unit ${d.device_id.substring(0, 4)}`,
      color: COLORS[index % COLORS.length]
    }));
  }, [devices]);

  const comparisonDeviceIds = useMemo(() => 
    comparisonConfig.map(c => c.id), 
  [comparisonConfig]);

  const { data: multiHistoryData } = useMultiDeviceHistory(comparisonDeviceIds, 20);

  const deviceFeatureData = useMemo(() => {
    return devices.slice(0, 4).map((d) => {
      const tel = telemetry[d.device_id] || {};
      return {
        name: d.deviceName?.split(" ")[0] || d.device_id.substring(0, 6),
        voltage: tel.voltage || 0,
        salinity: tel.tds_ppm || tel.tds || 0,
        current: tel.bulb_ma ? tel.bulb_ma / 10 : 0,
      };
    });
  }, [devices, telemetry]);

  return (
    <div className="mx-auto space-y-6 max-w-[1800px] animate-in fade-in duration-700">
      {/* 1. METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TotalDevicesAdminCard value={stats.total || 0} trendValue="12%" trend="up" />
        <OnlineDevicesCard value={stats.online || 0} trendValue="+2" trend="up" />
        <OfflineDevicesCard value={stats.offline || 0} trendValue="-1" trend="down" />
        <SystemHealthCard value={stats.health} status="Optimal" />
      </div>

      {/* 2. PERFORMANCE & HEALTH SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-9">
          <AnalyticsChart 
            data={multiHistoryData} 
            devices={comparisonConfig} 
          />
        </div>
        <div className="lg:col-span-3">
          <SystemHealthGauge
            voltage={Math.min(stats.health + 5, 100)}
            salinity={stats.health}
            current={Math.max(stats.health - 10, 0)}
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
                      <p className="text-base font-bold text-on-surface">
                        {req.deviceName || "Juan Dela Cruz"}
                      </p>
                      <p className="text-[11px] text-outline mt-1 font-medium uppercase tracking-widest">
                        {new Date(req.createdAt).toLocaleDateString()} •{" "}
                        {new Date(req.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="py-2.5 px-4 text-primary font-bold text-[11px] border border-primary/20 rounded-lg hover:bg-primary/5 transition-all">
                        View Details
                      </button>
                      <button className="py-2.5 px-4 bg-primary text-white font-bold text-[11px] rounded-lg shadow-sm hover:brightness-110 transition-all">
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
              <button className="w-full text-primary font-bold text-xs flex items-center justify-center gap-2 py-3 border border-primary/10 bg-primary/5 rounded-lg hover:bg-primary/10 transition-all">
                View all requests{" "}
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Feature Data & Table */}
        <div className="lg:col-span-8 space-y-6">
          <DeviceFeatureBarChart data={deviceFeatureData} />
          <DeviceUsersTable users={users?.slice(0, 3) || []} loading={usersLoading} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
