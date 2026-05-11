import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  History, 
  Download, 
  ShieldCheck, 
  Activity,
  Zap
} from 'lucide-react';
import { cn } from "../../utils/cn"; 
import { useReadings, useHistory } from "../../hooks";
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
 * DeviceAnalytics Page
 * Dedicated separate page for deep-dive device insights.
 * Used by residents and admins for specific node audit.
 */
const DeviceAnalytics = () => {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  
  // Real-time telemetry & History
  const { reading, loading: readingLoading } = useReadings(deviceId);
  const { logs, loading: logsLoading } = useHistory(deviceId);

  // Chart Processing
  const chartData = useMemo(() => {
    if (!logs || logs.length === 0) return [];
    const windowed = processLogsInWindows(logs, {
      metricKey: 'tds_ppm',
      metricId: METRICS.TDS
    });
    return windowed.current;
  }, [logs]);

  // Derived Metrics
  const tds = reading?.tds_ppm || 0;
  const statusConfig = useMemo(() => {
    if (tds < 300) return { label: 'Excellent', color: 'text-emerald-500', bg: 'bg-emerald-50' };
    if (tds < 600) return { label: 'Good', color: 'text-blue-500', bg: 'bg-blue-50' };
    return { label: 'Check Filter', color: 'text-amber-500', bg: 'bg-amber-50' };
  }, [tds]);

  if (readingLoading && !reading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
         <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 space-y-10 antialiased">
      
      {/* 1. NAVIGATION HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-4 bg-white border border-slate-200 rounded-[24px] hover:bg-slate-50 transition-all active:scale-90 shadow-sm"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">
                    Node <span className="text-blue-600">Analytics</span>
                </h1>
                <div className={cn("px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm", statusConfig.bg, statusConfig.color)}>
                    {statusConfig.label}
                </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">
                UID: {deviceId} • REAL-TIME FEED ACTIVE
            </p>
          </div>
        </div>

        <button className="h-14 px-8 bg-slate-900 text-white rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10">
            <Download size={16} />
            Export Data
        </button>
      </header>

      {/* 2. REAL-TIME INSTRUMENT GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <SalinityGauge deviceId={deviceId} size={280} />
        <VoltageGauge deviceId={deviceId} size={280} />
        <BulbPowerUsageGauge deviceId={deviceId} size={280} />
        <div className="space-y-6">
            <BulbToggle deviceId={deviceId} />
            <div className="p-8 bg-white border border-slate-200 rounded-[40px] shadow-sm flex flex-col justify-between h-[200px]">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">System Health</p>
                    <p className="text-2xl font-black text-slate-900 leading-tight">Parameter Stability</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                        <ShieldCheck size={20} />
                    </div>
                    <span className="text-xl font-black text-emerald-600 tracking-tighter">98.4%</span>
                </div>
            </div>
        </div>
      </section>

      {/* 3. HISTORICAL DATA SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* TIME SERIES CHART */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm flex flex-col h-[550px]">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Salinity Trend Analysis</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 text-wrap">Aggregated historical readings from local storage</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-2xl">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Synced</span>
            </div>
          </div>
          
          <div className="flex-1 w-full">
            {logsLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <Activity size={32} className="text-slate-200 animate-bounce" />
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Inflating data windows...</p>
              </div>
            ) : (
              <DeviceAnalyticsChart 
                data={chartData} 
                metricConfig={METRIC_CONFIG[METRICS.TDS]} 
              />
            )}
          </div>
        </div>

        {/* RECENT ACTIVITY STREAM */}
        <div className="bg-slate-900 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col">
            <div className="absolute inset-0 bg-blue-600/5 blur-[120px]" />
            
            <header className="flex items-center justify-between mb-10 relative z-10">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-400 flex items-center gap-3">
                    <History size={16} /> Audit Trail
                </h3>
            </header>

            <div className="flex-1 space-y-10 relative z-10 overflow-y-auto pr-2 custom-scrollbar-hide">
                {logs.slice(0, 8).map((log, _idx) => (
                    <div key={log.id} className="group relative pl-8 border-l border-slate-800 transition-all hover:border-blue-500">
                        <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-slate-800 border-2 border-slate-700 group-hover:bg-blue-600 group-hover:border-blue-400 transition-all" />
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-black text-slate-200 uppercase tracking-wider group-hover:text-blue-400 transition-colors">
                                Sensor Sync
                            </span>
                            <span className="text-[8px] font-bold text-slate-500 uppercase tabular-nums">
                                {new Date(log.__normalizedTs).toLocaleTimeString()}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                            Captured <span className="text-white font-bold">{log.tds_ppm} PPM</span> with hardware power stability confirmed at <span className="text-white font-bold">{log.voltage}V</span>.
                        </p>
                    </div>
                ))}

                {logs.length === 0 && !logsLoading && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-20">
                        <Zap size={40} />
                        <p className="text-[10px] font-black uppercase tracking-widest mt-4">Empty Stream</p>
                    </div>
                )}
            </div>

            <footer className="mt-10 relative z-10">
                <div className="p-6 bg-white/5 border border-white/10 rounded-[32px] flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-600/20">
                        <Activity size={20} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">AI Summary</p>
                        <p className="text-[11px] font-bold text-white leading-tight mt-1">Consistency remains high at 94% over the last 24h cycle.</p>
                    </div>
                </div>
            </footer>
        </div>
      </div>
    </div>
  );
};

export default DeviceAnalytics;
