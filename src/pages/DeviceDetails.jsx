import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeviceLogs } from '../hooks/ChartHooks/useDeviceLogs'; 
import MetricCard from '../components/Analytics/MetricCard';

const DeviceDetails = () => {
  const { mac } = useParams();
  const navigate = useNavigate();
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const isHistorical = selectedDate !== todayStr;

  const startTimestamp = useMemo(() => {
    return new Date(selectedDate).getTime();
  }, [selectedDate]);

  const { logs, stats, loading, isReconnecting } = useDeviceLogs(
    mac, 
    1000, 
    isHistorical ? startTimestamp : null
  );

  // --- CLEAN DEBUGGING ---
  useEffect(() => {
    if (!loading) {
      // Just a single line to confirm the data status
      console.log(`[${selectedDate}] Data Status: ${logs.length} packets retrieved.`);
    }
  }, [logs, loading, selectedDate]);

  const latest = useMemo(() => (logs.length > 0 ? logs[logs.length - 1] : null), [logs]);

  const handleResetToLive = () => setSelectedDate(todayStr);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <button 
              onClick={() => navigate('/')} 
              className="group flex items-center text-slate-400 hover:text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] transition-colors mb-2"
            >
              <span className="mr-2 transition-transform group-hover:-translate-x-1">←</span> 
              Fleet Overview
            </button>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Node <span className="text-blue-600">{mac}</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Select Archive Date</label>
              <input 
                type="date" 
                max={todayStr}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`bg-white border rounded-xl px-4 py-2 text-sm font-bold outline-none transition-all cursor-pointer ${
                  isHistorical ? 'border-blue-500 ring-4 ring-blue-500/10 shadow-sm' : 'border-slate-200 shadow-none'
                }`}
              />
            </div>

            {isHistorical && (
              <button 
                onClick={handleResetToLive}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
              >
                Jump to Live ⚡
              </button>
            )}
          </div>
        </div>

        {/* STATUS ALERTS */}
        {isReconnecting && !isHistorical && (
          <div className="mb-6 bg-amber-50 border border-amber-100 text-amber-600 p-4 rounded-3xl text-center text-[10px] font-black uppercase tracking-widest animate-pulse">
            📡 Signal Interrupted // Attempting to recover stream...
          </div>
        )}

        {isHistorical && !loading && (
          <div className="mb-6 bg-blue-600 text-white p-4 rounded-3xl flex items-center gap-3 shadow-xl shadow-blue-500/10">
             <span className="text-xl">📅</span>
             <div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Archive View</p>
               <p className="text-sm font-bold">{new Date(selectedDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
             </div>
          </div>
        )}

        <div className="space-y-6">
          {/* KPI METRIC GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard 
              label={isHistorical ? "Archive Salinity" : "Live Salinity"}
              value={latest?.tds_ppm || latest?.tds_value}
              timestamp={latest?.timestamp}
              unit="PPM"
              icon="💧"
              colorClass={isHistorical ? "text-slate-500" : "text-blue-600"}
              loading={loading}
            />
            <MetricCard 
              label={isHistorical ? "Archive Temp" : "Live Temp"}
              value={latest?.water_temp || latest?.tds_temp}
              timestamp={latest?.timestamp}
              unit="°C"
              icon="🌡️"
              colorClass={isHistorical ? "text-slate-500" : "text-orange-500"}
              loading={loading}
            />
            
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center transition-all hover:border-blue-200">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                 {isHistorical ? "Archive Average" : "Daily Average"}
               </p>
               <h3 className="text-2xl font-black text-slate-900">
                 {isHistorical ? stats.avgTDS : stats.avgTemp} 
                 <span className="text-sm font-bold text-slate-400 ml-1">
                   {isHistorical ? "PPM" : "°C"}
                 </span>
               </h3>
               <p className="text-[9px] font-bold text-slate-400 mt-2 italic">
                 Based on {stats.count} recorded points
               </p>
            </div>
          </div>

          {/* VISUALIZATION PANEL */}
          <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 relative">
            <header className="mb-10">
              <h2 className="text-xl font-black text-slate-900">Telemetry Analysis</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                {isHistorical ? `Historical dataset for ${selectedDate}` : "Active real-time telemetry stream"}
              </p>
            </header>

            <div className="min-h-[600px] w-full relative">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-4">
                  <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">Retrieving Database...</p>
                </div>
              ) : logs.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-3xl">
                   <p className="font-black uppercase tracking-widest text-[11px]">No telemetry found for this date</p>
                </div>
              ) : (
                <ChartContainer logs={logs} mac={mac} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceDetails;