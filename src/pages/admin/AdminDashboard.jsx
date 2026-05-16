import { useMemo } from "react";
import {
  useUserSubscription,
  useAuditLogs,
  useDeviceRequests,
  useDevices,
  useHistory,
} from "../../hooks";
import { 
  MetricCard, 
  AnalyticsChart, 
  SystemHealthGauge,
  DeviceFeatureBarChart,
  SystemAlertItem,
  DeviceUsersTable
} from "../../components";

/**
 * MAIN ADMIN DASHBOARD PAGE
 * Synchronized with dashboard.html main content.
 */
const AdminDashboard = () => {
  const { data: users, loading: usersLoading } = useUserSubscription();
  const { logs: auditLogs } = useAuditLogs(10);
  const { requests } = useDeviceRequests();
  const { devices, telemetry } = useDevices();

  // DATA CALCULATION: Real-time Device Stats
  const now = Date.now();
  const onlineThreshold = 300000; // 5 minutes

  const stats = useMemo(() => {
    const total = devices.length;
    let online = 0;
    
    devices.forEach(d => {
      const tel = telemetry[d.device_id];
      if (tel && tel.timestamp && (now - tel.timestamp < onlineThreshold)) {
        online++;
      }
    });

    return {
      total,
      online,
      offline: total - online,
      health: total > 0 ? Math.round((online / total) * 100) : 0
    };
  }, [devices, telemetry, now]);

  // DATA CALCULATION: Chart Data Mapping
  const activeDeviceId = useMemo(() => {
    return devices.length > 0 ? devices[0].device_id : null;
  }, [devices]);

  const { logs: historicalLogs } = useHistory(activeDeviceId, 20);

  const voltageData = useMemo(() => {
    if (!historicalLogs) return [];
    return [...historicalLogs].reverse().map((log) => ({
      timestamp: new Date(log.__normalizedTs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      value: log.voltage || 0,
    }));
  }, [historicalLogs]);

  const salinityData = useMemo(() => {
    if (!historicalLogs) return [];
    return [...historicalLogs].reverse().map((log) => ({
      timestamp: new Date(log.__normalizedTs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      value: log.tds_ppm || 0,
    }));
  }, [historicalLogs]);

  const deviceFeatureData = useMemo(() => {
    return devices.slice(0, 4).map(d => {
      const tel = telemetry[d.device_id] || {};
      return {
        name: d.deviceName?.split(' ')[0] || d.device_id.substring(0, 6),
        voltage: tel.voltage || 0,
        salinity: tel.tds_ppm || tel.tds || 0,
        current: tel.bulb_ma ? (tel.bulb_ma / 10) : 0
      };
    });
  }, [devices, telemetry]);

  // DATA CALCULATION: Alerts Mapping
  const systemAlerts = useMemo(() => {
    return auditLogs?.slice(0, 3).map(log => ({
      id: log.id,
      title: log.action.replace(/_/g, ' '),
      description: log.details || "System activity detected.",
      time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: log.action.includes('ERROR') || log.action.includes('FAILURE') ? 'error' : 
            log.action.includes('WARNING') ? 'warning' : 'info'
    })) || [];
  }, [auditLogs]);

  return (
    <div className="mx-auto space-y-6 max-w-[1800px] animate-in fade-in duration-700">
      {/* 1. METRICS BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Devices"
          value={stats.total || 128}
          status="Since last month"
          icon="router"
          trend="up"
          trendValue="12%"
        />
        <MetricCard
          title="online Device"
          value={stats.online || 8}
          status="Active warnings"
          icon="sensors"
          colorClass="text-orange-500"
          bgIconClass="bg-orange-50"
          trend="up"
          trendValue="+2"
        />
        <MetricCard
          title="Offline Devices"
          value={stats.offline || 4}
          status="Network status"
          icon="signal_wifi_off"
          colorClass="text-red-500"
          bgIconClass="bg-red-50"
          trend="down"
          trendValue="-1"
        />
        <MetricCard
          title="System Health"
          value={`${stats.health}%`}
          status="Overall efficiency"
          statusValue="Optimal"
          icon="ecg_heart"
          colorClass="text-teal-600"
          bgIconClass="bg-teal-50"
          isHealth
        />
      </div>

      {/* 2. PERFORMANCE & HEALTH SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-9">
          <AnalyticsChart voltageData={voltageData} salinityData={salinityData} />
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
          <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col">
            <h3 className="font-bold text-sm uppercase tracking-wider text-on-surface-variant mb-6">
              System Alerts
            </h3>
            <div className="space-y-4 mb-6">
              {systemAlerts.map(alert => (
                <SystemAlertItem key={alert.id} {...alert} />
              ))}
              {systemAlerts.length === 0 && (
                <p className="text-center py-10 text-[10px] font-black text-outline uppercase tracking-widest">
                  No active alerts
                </p>
              )}
            </div>
            <button className="w-full text-primary font-bold text-xs flex items-center justify-center gap-2 py-3 border border-primary/10 bg-primary/5 rounded-lg hover:bg-primary/10 transition-all">
              View all alerts <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col">
            <h3 className="font-bold text-sm uppercase tracking-wider text-on-surface-variant mb-6 text-center">
              DEVICE REQUEST
            </h3>
            <div className="space-y-6 flex-1">
              {requests?.filter(r => r.status === 'pending').slice(0, 2).map(req => (
                <div key={req.id} className="border border-outline-variant/30 rounded-xl p-4">
                  <div className="text-center mb-4">
                    <p className="text-base font-bold text-on-surface">{req.deviceName || "Juan Dela Cruz"}</p>
                    <p className="text-[11px] text-outline mt-1 font-medium uppercase tracking-widest">
                      {new Date(req.createdAt).toLocaleDateString()} • {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
              {requests?.filter(r => r.status === 'pending').length === 0 && (
                <p className="text-center py-10 text-[11px] font-bold text-outline uppercase tracking-widest">
                  No pending requests
                </p>
              )}
            </div>
            <div className="mt-6">
              <button className="w-full text-primary font-bold text-xs flex items-center justify-center gap-2 py-3 border border-primary/10 bg-primary/5 rounded-lg hover:bg-primary/10 transition-all">
                View all requests <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
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
