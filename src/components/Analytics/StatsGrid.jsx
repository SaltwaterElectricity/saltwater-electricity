import { memo, useMemo } from 'react';
import StatCard from './StatCard';
import { METRIC_CONFIG } from '../../constants';

/**
 * STATS GRID
 * Organizes Min, Max, and Trend analytics into a responsive row.
 * Placed typically beneath the main telemetry chart.
 */
const StatsGrid = ({ stats, activeMetric }) => {
  // 1. Setup: Grab UI config (units, labels) for the active metric
  const config = useMemo(() => METRIC_CONFIG[activeMetric], [activeMetric]);

  // 2. Guard: If stats are missing (e.g., data still fetching), render skeletons or null
  if (!stats || !config) return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-slate-100 rounded-3xl" />
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {/* 1. MAX STAT - Highest point in the current time window */}
      <StatCard 
        label="Peak Value" 
        value={stats.max} 
        unit={config.unit} 
        type="max" 
      />

      {/* 2. MIN STAT - Lowest point in the current time window */}
      <StatCard 
        label="Lowest Point" 
        value={stats.min} 
        unit={config.unit} 
        type="min" 
      />

      {/* 3. TREND STAT - Percentage delta between current and previous windows */}
      <StatCard 
        label="Period Trend" 
        value={`${stats.delta >= 0 ? '+' : ''}${stats.delta}%`} 
        unit="vs prev." 
        type="trend"
        trendValue={stats.delta}
      />
    </div>
  );
};

export default memo(StatsGrid);