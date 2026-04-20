import { useMemo } from 'react';
import { processLogsInWindows, getFormattedStats } from '../../utils/chartUtils';
import { useSortedLogs } from './useSortedLogs';
import { 
  METRICS, 
  METRIC_MAP, 
  METRIC_CONFIG, 
  EMPTY_STATE, 
  TIME_FORMATTER 
} from '../../constants';

/**
 * HOOK: useChartData
 * The primary orchestrator for the Analytics View.
 * Connects raw logs to the highly-optimized single-pass data engine.
 */
export const useChartData = (logs, activeMetric = METRICS.TDS, timeRangeHours = 1) => {
  // 1. Process Raw Logs (Limit entries for initial performance)
  const { data: cleanLogs, hasData } = useSortedLogs(logs, 1000); 

  return useMemo(() => {
    // --- SAFETY CHECK: Initial Guard ---
    if (!hasData || !cleanLogs || cleanLogs.length === 0) {
      return EMPTY_STATE;
    }

    try {
      const now = Date.now();
      const windowMs = timeRangeHours * 3600000; // ms in an hour

      /**
       * DATA MAPPING BRIDGE
       * Rule: Guaranteed string lookup for the database field key.
       */
      const databaseKey = METRIC_MAP[activeMetric] || activeMetric;

      // 2. Windowing Logic: Segmenting into "Now" and "Comparison" periods
      const result = processLogsInWindows(cleanLogs, {
        metricKey: databaseKey, 
        metricId: activeMetric,
        currentWindowStart: now - windowMs,
        comparisonWindowStart: now - (windowMs * 2)
      });

      // --- SAFETY CHECK: Window Guard ---
      if (!result.current || result.current.length === 0) {
        return EMPTY_STATE;
      }

      // 3. Stats Calculation: Utilizing the high-performance single-pass engine
      const stats = getFormattedStats(result, activeMetric);

      // 4. Transform & Slice: Memory Optimization for SVG Rendering
      const chartData = result.current
        .slice(-200) 
        .map(point => ({
          ...point,
          displayTime: point.timestamp ? TIME_FORMATTER.format(point.timestamp) : '--:--'
        }));

      return {
        data: chartData,
        stats: stats, 
        hasData: true,
        ui: METRIC_CONFIG[activeMetric] || METRIC_CONFIG.DEFAULT
      };
      
    } catch (e) {
      console.error("[Hook Error]: Critical Chart Transformation Failure", e);
      return EMPTY_STATE;
    }
    
  }, [cleanLogs, hasData, activeMetric, timeRangeHours]);
};