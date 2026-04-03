import { useState } from 'react';
import { 
  DashboardHeader, 
  StatusSidebar, 
  ChartContainer 
} from '../../components'; // Single source for all UI
import { useChartData } from '../../hooks/ChartHooks/useChartData';
import { METRICS } from '../../constants';
/**
 * ANALYTICS VIEW
 * Master orchestrator for the SMARTAQUA dashboard.
 * Implementation: Optimized grid layout with semantic sectioning and defensive loading states.
 */
const AnalyticsView = () => {
  // 1. UI STATE
  const [activeMetric, setActiveMetric] = useState(METRICS.TDS);
  const [timeRange, setTimeRange] = useState(24);

  // 2. DATA ENGINE
  const { 
    latestReading, 
    chartResponse, 
    stats, 
    loading 
  } = useChartData(activeMetric, timeRange);

  // 3. DEFENSIVE LOADING: Prevents layout shift (CLS) during initial fetch
  if (!latestReading && loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-pulse">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin" />
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
          Synchronizing System...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* SECTION 1: TOP-LEVEL METRICS */}
      <section aria-label="Current Telemetry Overview">
        <DashboardHeader 
          latestReading={latestReading} 
          loading={loading} 
        />
      </section>

      {/* SECTION 2: MAIN ANALYSIS GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* Primary Visualization (2/3 width) */}
        <section className="xl:col-span-2" aria-label="Historical Data Analysis">
          <ChartContainer 
            activeMetric={activeMetric}
            onMetricChange={setActiveMetric}
            timeRange={timeRange}
            onRangeChange={setTimeRange}
            chartResponse={chartResponse}
            stats={stats}
            loading={loading}
          />
        </section>

        {/* System Integrity Sidebar (1/3 width) */}
        <section aria-label="Hardware Status and Connectivity">
          <StatusSidebar 
            latestReading={latestReading} 
            loading={loading} 
          />
        </section>
        
      </div>
    </div>
  );
};

export default AnalyticsView;