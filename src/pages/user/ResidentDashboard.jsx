import { useMemo } from 'react';
import { 
  History, 
  Bell
} from 'lucide-react';
import { useAuth } from "../../context/useAuth";
import { useDevices, useHistory } from "../../hooks";
import { DeviceAnalyticsChart } from "../../components";
import { 
  SalinityGauge, 
  VoltageGauge, 
  BulbPowerUsageGauge, 
  BulbToggle 
} from "../../components/ui";
import { processLogsInWindows } from "../../utils/chartUtils";
import { METRICS, METRIC_CONFIG } from "../../constants";

/**
 * ResidentDashboard Component
 * High-fidelity personal monitoring hub for residents.
 * Focuses on real-time water quality and energy usage.
 */
const ResidentDashboard = () => {
  const { user } = useAuth();
  const { devices, loading: devicesLoading } = useDevices();

  // Find the device assigned to the current resident
  const userDevice = useMemo(() => {
    if (!user || !devices) return null;
    return devices.find(d => d.assigned_user_id === user.uid || d.assigned_user_id === user.id);
  }, [user, devices]);

  // Fetch Logs for the assigned device
  const { logs, loading: logsLoading } = useHistory(userDevice?.device_id);

  const chartData = useMemo(() => {
    if (!logs || logs.length === 0) return [];
    const windowed = processLogsInWindows(logs, {
      metricKey: 'tds_ppm',
      metricId: METRICS.TDS
    });
    return windowed.current;
  }, [logs]);

  if (devicesLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4 animate-pulse">Syncing Facility Data...</p>
      </div>
    );
  }

  if (!userDevice) {
    return (
        <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center text-center">
            <div className="max-w-md p-12 bg-white rounded-[40px] shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500 shadow-inner">
                    <History size={32} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">No Active Node</h2>
                <p className="text-sm text-slate-500 mt-4 leading-relaxed font-medium">
                    Your account doesn't have an assigned monitoring unit yet. Contact the facility administrator to provision your hardware.
                </p>
            </div>
        </div>
    );
  }

  const deviceId = userDevice.device_id;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 space-y-8 antialiased text-slate-900">
      
      {/* HEADER SECTION */}
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-black italic tracking-tighter">
            SmartAqua <span className="text-blue-600">Resident</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Node: {userDevice.device_name} • #{deviceId}
          </p>
        </div>
        <button className="relative p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm group">
          <Bell size={20} className="text-slate-600 group-hover:text-blue-600 transition-colors" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      </header>

      {/* INTERACTIVE INSTRUMENT GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        <SalinityGauge deviceId={deviceId} size={240} />
        <VoltageGauge deviceId={deviceId} size={240} />
        <BulbPowerUsageGauge deviceId={deviceId} size={240} />
        <div className="h-full flex flex-col justify-start">
            <BulbToggle deviceId={deviceId} />
            <div className="mt-6 p-6 bg-blue-600 rounded-[32px] text-white shadow-xl shadow-blue-900/20 group hover:scale-[1.02] transition-transform duration-500">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-2">Facility Guard</p>
                <p className="text-sm font-bold leading-tight">Your water quality is within the <span className="underline decoration-blue-300">excellent</span> range.</p>
            </div>
        </div>
      </section>

      {/* ANALYSIS & LOGS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <main className="lg:col-span-2 bg-white/70 backdrop-blur-xl p-8 rounded-[40px] border border-white shadow-sm flex flex-col min-h-[500px] transition-all hover:bg-white/80">
          <div className="flex items-center justify-between mb-8">
            <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 leading-none">Salinity Performance</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">7-Day Trend Analysis</p>
            </div>
            <div className="flex gap-2">
              <span className="text-[8px] font-black px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100 uppercase tracking-widest">Historical View</span>
            </div>
          </div>
          
          <div className="flex-1 min-h-[300px]">
            {logsLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-8 h-8 border-2 border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Syncing Archive...</p>
              </div>
            ) : (
              <DeviceAnalyticsChart 
                data={chartData} 
                metricConfig={METRIC_CONFIG[METRICS.TDS]} 
              />
            )}
          </div>
        </main>

        <aside className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl overflow-hidden relative group h-full">
          <div className="absolute inset-0 bg-blue-600/5 blur-3xl group-hover:bg-blue-600/10 transition-colors duration-700" />
          <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-8 flex items-center gap-2 relative z-10">
            <History size={14} /> Activity Stream
          </h3>
          
          <div className="space-y-8 relative z-10 overflow-y-auto max-h-[400px] custom-scrollbar-hide">
             {logs.slice(0, 5).map((log) => (
                 <div key={log.id} className="relative pl-6 border-l border-slate-800 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.6)]" />
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black text-slate-200 uppercase tracking-wider">
                            Reading Sync
                        </span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase">
                            {new Date(log.__normalizedTs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                        System recorded <span className="text-blue-400 font-bold">{log.tds_ppm} PPM</span> with node voltage at <span className="text-amber-400 font-bold">{log.voltage}V</span>.
                    </p>
                 </div>
             ))}

             {logs.length === 0 && !logsLoading && (
                 <div className="py-12 text-center">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No Stream Activity</p>
                 </div>
             )}
          </div>

          <button className="w-full mt-12 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all relative z-10 active:scale-95">
             View Full Report
          </button>
        </aside>
      </div>
    </div>
  );
};

export default ResidentDashboard;
