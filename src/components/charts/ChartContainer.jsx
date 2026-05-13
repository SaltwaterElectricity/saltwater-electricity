import { memo, useMemo } from 'react';
import PropTypes from 'prop-types'; // Added the missing import
import TelemetryChart from './TelemetryChart';
import TimeRangeSelector from './TimeRangeSelector';
import MetricToggle from './MetricToggle';
import StatsGrid from '../Analytics/StatsGrid'; 
import { METRIC_CONFIG } from '../../constants';

/**
 * CHART CONTAINER
 * Orchestrates the relationship between filters, visualization, and analytics.
 */
const ChartContainer = ({ 
  activeMetric, 
  onMetricChange, 
  timeRange, 
  onRangeChange, 
  chartResponse, 
  stats, 
  loading 
}) => {

  // 1. Theme Sync: Derive UI styles based on the active metric
 const uiConfig = useMemo(() => {
  // Now METRIC_CONFIG[activeMetric] and METRIC_CONFIG.DEFAULT exist and match!
  const config = METRIC_CONFIG[activeMetric] || METRIC_CONFIG.DEFAULT; 
  
  return {
    color: config.chartColor, // Safe to access directly now
    unit: config.unit,
    gradientId: `gradient-${activeMetric}`,
  };
}, [activeMetric]);

  return (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-6 transition-all duration-500">
      
      {/* 1. CONTROLS: Metric & Time Selection */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <MetricToggle 
          activeMetric={activeMetric} 
          onMetricChange={onMetricChange} 
        />
        <TimeRangeSelector 
          currentRange={timeRange} 
          onRangeChange={onRangeChange} 
        />
      </div>

      {/* 2. VISUALIZATION: The Main Chart */}
      <div className={`relative h-[320px] w-full transition-opacity duration-700 ${loading ? 'opacity-30' : 'opacity-100'}`}>
        <TelemetryChart 
          chartResponse={chartResponse} 
          uiConfig={uiConfig} 
        />
        
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-slate-400 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* 3. ANALYTICS: Min, Max, and Trend Grid */}
      <div className={`mt-2 pt-6 border-t border-slate-50 transition-all duration-300 ${loading ? 'opacity-50 blur-[1px]' : 'opacity-100'}`}>
        <StatsGrid 
          stats={stats} 
          activeMetric={activeMetric} 
        />
      </div>

      {/* 4. FOOTER: Data Integrity Check */}
      {!loading && !chartResponse?.hasData && (
        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Hardware disconnected: Check sensor bridge
        </p>
      )}
    </div>
  );
};

// 5. DATA VALIDATION: Detailed PropType implementation
ChartContainer.propTypes = {
  activeMetric: PropTypes.string.isRequired,
  onMetricChange: PropTypes.func.isRequired,
  timeRange: PropTypes.number.isRequired,
  onRangeChange: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  chartResponse: PropTypes.shape({
    data: PropTypes.arrayOf(PropTypes.object),
    hasData: PropTypes.bool
  }),
  stats: PropTypes.shape({
    max: PropTypes.number,
    min: PropTypes.number,
    delta: PropTypes.number
  })
};

export default memo(ChartContainer);