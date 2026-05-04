import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDevices } from '../../hooks/useDevices';
import { useReadings } from '../../hooks/useReadings';
import { METRIC_CONFIG, METRICS, TIME_RANGES } from '../../constants';
import { DeviceAnalyticsChart } from '../../components';

/**
 * Analytics Page
 * Displays historical performance metrics using AlonKuryente design standards.
 */
const Analytics = () => {
  const { deviceId } = useParams();
  const { devices } = useDevices();
  const device = devices.find(d => d.id === deviceId);
  const [range, setRange] = useState(24); // Default to 24H
  
  const { readings, loading } = useReadings(deviceId, range);

  if (!device) return <div className="p-lg text-slate-500">Device not found.</div>;

  return (
    <div className="space-y-lg animate-in fade-in duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="font-h1 text-h1 text-on-surface mb-xs tracking-tight italic uppercase">
            {device.name} <span className="text-blue-600">Analytics</span>
          </h2>
          <p className="font-body-md text-slate-500">Performance history for selected monitoring interval.</p>
        </div>
        
        {/* TIME RANGE SELECTOR */}
        <div className="flex bg-white/50 p-1 rounded-full border border-slate-200">
          {TIME_RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase transition-all ${
                range === r.value 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-500 hover:text-blue-600'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* HISTORICAL PERFORMANCE MATRIX */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[METRICS.TDS, METRICS.TEMP].map((metric) => (
          <div key={metric} className="glass-panel p-6 h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-h2 text-sm text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                {METRIC_CONFIG[metric].icon} {METRIC_CONFIG[metric].label} History
              </h3>
            </div>
            
            <div className="flex-1 min-h-0">
              {loading ? (
                <div className="h-full flex items-center justify-center opacity-30">
                  <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
                </div>
              ) : (
                <DeviceAnalyticsChart 
                  data={readings.map(r => ({ timestamp: r.timestamp, value: r[metric] }))} 
                  metricConfig={METRIC_CONFIG[metric]} 
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Analytics;