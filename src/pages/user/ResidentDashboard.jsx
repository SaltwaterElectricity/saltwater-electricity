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
      <div className="min-h-screen bg-background p-8 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-label-sm font-semibold text-outline uppercase tracking-widest mt-4 animate-pulse font-['Inter']">Syncing Facility Data...</p>
      </div>
    );
  }

  if (!userDevice) {
    return (
        <div className="min-h-screen bg-background p-8 flex items-center justify-center text-center">
            <div className="max-w-md p-12 glass-panel shadow-xl animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-primary shadow-inner">
                    <History size={32} />
                </div>
                <h2 className="text-h2 font-['Space_Grotesk'] font-bold text-primary tracking-tight italic">No Active Node</h2>
                <p className="text-body-md text-on-surface-variant mt-4 leading-relaxed font-['Inter']">
                    Your account doesn&apos;t have an assigned monitoring unit yet. Contact the facility administrator to provision your hardware.
                </p>
            </div>
        </div>
    );
  }

  const deviceId = userDevice.device_id;

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 space-y-8 antialiased text-on-surface">
      
      {/* HEADER SECTION */}
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-h2 font-['Space_Grotesk'] font-bold italic tracking-tighter">
            SmartAqua <span className="text-primary">Resident</span>
          </h1>
          <p className="text-label-sm font-semibold text-outline uppercase tracking-wider font-['Inter']">
            Node: {userDevice.device_name} • #{deviceId}
          </p>
        </div>
        <button className="relative p-3 glass-panel rounded-xl hover:bg-primary/5 transition-all active:scale-95 shadow-sm group border-outline/20">
          <Bell size={20} className="text-on-surface-variant group-hover:text-primary transition-colors" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white animate-pulse" />
        </button>
      </header>

      {/* INTERACTIVE INSTRUMENT GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        <SalinityGauge deviceId={deviceId} size={240} />
        <VoltageGauge deviceId={deviceId} size={240} />
        <BulbPowerUsageGauge deviceId={deviceId} size={240} />
        <div className="h-full flex flex-col justify-start">
            <BulbToggle deviceId={deviceId} />
            <div className="mt-6 p-6 bg-primary rounded-[20px] text-white shadow-xl shadow-primary/20 group hover:scale-[1.02] transition-transform duration-500">
                <p className="text-label-sm font-bold uppercase tracking-widest text-primary-fixed mb-2 font-['Inter']">Facility Guard</p>
                <p className="text-body-md font-bold leading-tight font-['Inter']">Your water quality is within the <span className="underline decoration-secondary-container">excellent</span> range.</p>
            </div>
        </div>
      </section>

      {/* ANALYSIS & LOGS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <main className="lg:col-span-2 glass-panel p-8 shadow-sm flex flex-col min-h-[500px] transition-all hover:bg-white/80">
          <div className="flex items-center justify-between mb-8">
            <div>
                <h3 className="text-label-sm font-bold uppercase tracking-widest text-on-surface leading-none font-['Inter']">Salinity Performance</h3>
                <p className="text-label-sm font-semibold text-outline uppercase tracking-widest mt-2 font-['Inter']">7-Day Trend Analysis</p>
            </div>
            <div className="flex gap-2">
              <span className="text-label-sm font-bold px-3 py-1.5 bg-primary/5 text-primary rounded-full border border-primary/10 uppercase tracking-widest font-['Inter']">Historical View</span>
            </div>
          </div>
          
          <div className="flex-1 min-h-[300px]">
            {logsLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-8 h-8 border-2 border-primary/10 border-t-primary rounded-full animate-spin" />
                <p className="text-label-sm font-semibold text-outline uppercase tracking-[0.2em] font-['Inter']">Syncing Archive...</p>
              </div>
            ) : (
              <DeviceAnalyticsChart 
                data={chartData} 
                metricConfig={METRIC_CONFIG[METRICS.TDS]} 
              />
            )}
          </div>
        </main>

        <aside className="bg-primary-container rounded-[20px] p-8 text-white shadow-2xl overflow-hidden relative group h-full">
          <div className="absolute inset-0 bg-white/5 blur-3xl group-hover:bg-white/10 transition-colors duration-700" />
          <h3 className="text-label-sm font-bold uppercase tracking-widest text-secondary-container mb-8 flex items-center gap-2 relative z-10 font-['Inter']">
            <History size={14} /> Activity Stream
          </h3>
          
          <div className="space-y-8 relative z-10 overflow-y-auto max-h-[400px] custom-scrollbar-hide">
             {logs.slice(0, 5).map((log) => (
                 <div key={log.id} className="relative pl-6 border-l border-white/10 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-secondary-container shadow-[0_0_10px_rgba(0,193,253,0.6)]" />
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-label-sm font-bold text-white uppercase tracking-wider font-['Inter']">
                            Reading Sync
                        </span>
                        <span className="text-label-sm font-semibold text-white/50 uppercase font-['Inter']">
                            {new Date(log.__normalizedTs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <p className="text-label-sm text-white/80 font-medium font-['Inter']">
                        System recorded <span className="text-secondary-container font-bold">{log.tds_ppm} PPM</span> with node voltage at <span className="text-tertiary-fixed font-bold">{log.voltage}V</span>.
                    </p>
                 </div>
             ))}

             {logs.length === 0 && !logsLoading && (
                 <div className="py-12 text-center">
                    <p className="text-label-sm font-bold text-white/40 uppercase tracking-widest font-['Inter']">No Stream Activity</p>
                 </div>
             )}
          </div>

          <button className="w-full mt-12 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-label-sm font-bold tracking-widest uppercase transition-all relative z-10 active:scale-95 font-['Inter']">
             View Full Report
          </button>
        </aside>
      </div>
    </div>
  );
};

export default ResidentDashboard;
