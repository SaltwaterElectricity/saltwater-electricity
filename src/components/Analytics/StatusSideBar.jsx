import React, { memo } from 'react';
import PropTypes from 'prop-types';
import MetricCard from './MetricCard';
import { METRIC_CONFIG } from '../../constants';

/**
 * STATUS SIDEBAR
 * Orchestrates hardware integrity and data freshness cards.
 * Performance: Memoized to prevent sidebar jitters during chart updates.
 */
const StatusSidebar = ({ latestReading, loading }) => {
  // 1. Safety Guard: Fallback to empty object to prevent mapping errors
  const data = latestReading || {};
  
  // 2. Extract timestamp once for consistent "time-ago" calculation across cards
  const timestamp = data.timestamp;

  return (
    <aside className="flex flex-col gap-6">
      {/* Sidebar Header */}
      <div className="px-2">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
          System Health
        </h3>
        <p className="text-[11px] text-slate-300 font-medium">
          Sensor connectivity & data freshness
        </p>
      </div>

      {/* 3. Configuration-Driven Mapping */}
      <div className="space-y-4">
        {METRIC_CONFIG && Object.entries(METRIC_CONFIG)
          .filter(([key]) => key !== 'DEFAULT')
          .map(([key, config]) => (
            <MetricCard
              key={key}
              {...config}         // Spreads label, unit, icon, colorClass
              value={data[key]}   // Dynamic sensor value (e.g., 450.5)
              timestamp={timestamp} 
              loading={loading}
            />
          ))}
      </div>

      {/* Hardware Maintenance Footer */}
      <div className="mt-4 p-5 rounded-[2rem] bg-slate-900 text-white shadow-xl transition-all hover:scale-[1.01]">
        <div className="flex justify-between items-start mb-4">
          <p className="text-[10px] font-black uppercase opacity-50">Hardware Node</p>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
        </div>
        <div className="flex justify-between items-end">
          <p className="text-xl font-black tracking-tight">Active</p>
          <p className="text-[10px] font-mono opacity-40">v2.4.0-prod</p>
        </div>
      </div>
    </aside>
  );
};

// 4. Robust Prop Validation: Defines the expected shape of telemetry data
StatusSidebar.propTypes = {
  latestReading: PropTypes.shape({
    timestamp: PropTypes.number,
    tds: PropTypes.number,
    temp: PropTypes.number,
  }),
  loading: PropTypes.bool
};

export default memo(StatusSidebar);