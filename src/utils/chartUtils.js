/**
 * src/utils/chartUtils.js
 * High-Performance Data Engine for SMARTAQUA Dashboard.
 */
<<<<<<< HEAD
import { formatStats } from "./formatStats";
import { SENSOR_CONFIG, EMPTY_STATE, APP_SETTINGS } from "../constants";
import { logger } from "./logger";
=======
import { formatStats } from './formatStats';
import { SENSOR_CONFIG, EMPTY_STATE, APP_SETTINGS } from '../constants';
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a

// --- 1. HELPER: Data Sanitization ---
/**
 * Ensures we only deal with numbers or nulls for chart stability.
 * Note: useSortedLogs handles the bulk cleaning; this handles specific metric extraction.
 */
const normalizeSensorValue = (val) => {
<<<<<<< HEAD
  if (val === undefined || val === null || val === "") return null;
=======
  if (val === undefined || val === null || val === '') return null;
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
  const parsed = parseFloat(val);
  return isNaN(parsed) ? null : parsed;
};

// --- 2. PROCESSOR: Time-Series Segmentation ---
/**
 * Segments logs into current and previous windows for trend analysis.
 * UPDATED: Optimized to utilize __normalizedTs provided by useSortedLogs.
 */
export const processLogsInWindows = (
<<<<<<< HEAD
  sortedLogs = [],
  {
    metricKey,
    metricId,
    currentWindowStart = Date.now(),
    comparisonWindowStart = Date.now() - 3600000,
=======
  sortedLogs = [], 
  { 
    metricKey, 
    metricId, 
    currentWindowStart = Date.now(), 
    comparisonWindowStart = Date.now() - 3600000 
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
  } = {}
) => {
  // Guard Clause: Prevent processing without essential identifiers
  if (!metricKey || !metricId) {
<<<<<<< HEAD
    logger.error("[Data Engine]: Missing required metricKey or metricId mapping.");
    return { current: [], previous: [], currentValues: [], previousValues: [], lastTs: 0 };
  }

  const result = {
    current: [],
    previous: [],
    currentValues: [],
    previousValues: [],
    lastTs: 0,
  };

  const gapThreshold = APP_SETTINGS.STALE_THRESHOLD;
=======
    console.error("[Data Engine]: Missing required metricKey or metricId mapping.");
    return { current: [], previous: [], currentValues: [], previousValues: [], lastTs: 0 };
  }

  const result = { 
    current: [], 
    previous: [], 
    currentValues: [],  
    previousValues: [], 
    lastTs: 0 
  };
  
  const gapThreshold = APP_SETTINGS.STALE_THRESHOLD; 
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
  const now = Date.now();

  for (const entry of sortedLogs) {
    // Optimization: Prioritize the pre-normalized timestamp from useSortedLogs
    const ts = entry.__normalizedTs || entry.timestamp;
    if (!ts) continue;

    // Safety: Skip future logs and logs outside our comparison range
    // We break because sortedLogs is guaranteed to be chronological by useSortedLogs
<<<<<<< HEAD
    if (ts > now + 5000) break;
=======
    if (ts > now + 5000) break; 
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
    if (ts < comparisonWindowStart) continue;

    const val = normalizeSensorValue(entry[metricKey]);

    if (ts < currentWindowStart) {
      // Historical baseline collection
      if (val !== null) {
        result.previous.push({ ...entry, value: val });
<<<<<<< HEAD
        result.previousValues.push(val);
      }
    } else {
      // Active window processing with gap detection
      const hasGap = result.lastTs > 0 && ts - result.lastTs > gapThreshold;

      if (hasGap) {
        result.current.push({
          timestamp: result.lastTs + 1,
          value: null,
          isGap: true,
=======
        result.previousValues.push(val); 
      }
    } else {
      // Active window processing with gap detection
      const hasGap = result.lastTs > 0 && (ts - result.lastTs) > gapThreshold;
      
      if (hasGap) {
        result.current.push({ 
          timestamp: result.lastTs + 1, 
          value: null, 
          isGap: true 
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
        });
      }

      result.current.push({ ...entry, timestamp: ts, value: val });
<<<<<<< HEAD
      if (val !== null) result.currentValues.push(val);

=======
      if (val !== null) result.currentValues.push(val); 
      
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
      result.lastTs = ts;
    }
  }

  return result;
};

// --- 3. ORCHESTRATOR: Safety & Validation ---
/**
 * Converts windowed data into UI-ready statistics while validating hardware health.
 */
export const getFormattedStats = (windowData, metricId) => {
  if (!windowData?.currentValues || windowData.currentValues.length === 0) {
    return EMPTY_STATE.stats;
  }

  try {
    const stats = formatStats(windowData);
    const config = SENSOR_CONFIG[metricId] || {};

    // Logic: Validation against hardware physical limits
    if (config.max && stats.latest > config.max) {
<<<<<<< HEAD
      logger.warn(
        `[Hardware Alert]: ${metricId} reading (${stats.latest}) is physically impossible.`
      );
=======
      console.warn(`[Hardware Alert]: ${metricId} reading (${stats.latest}) is physically impossible.`);
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
    }

    // Logic: Detection of stuck/stale sensor hardware
    const isStale = stats.count > 10 && stats.min === stats.max;
    if (isStale) {
<<<<<<< HEAD
      logger.warn(`[Hardware Alert]: ${metricId} sensor output is flatlining (stale).`);
=======
      console.warn(`[Hardware Alert]: ${metricId} sensor output is flatlining (stale).`);
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
    }

    return stats;
  } catch (error) {
<<<<<<< HEAD
    logger.error("[Data Engine Error]: Stats orchestration failed.", error.message);
    return EMPTY_STATE.stats;
  }
};

/**
 * Generates an SVG path from telemetry data points.
 * Scales data to a 100x40 coordinate system.
 */
export const generateSVGPath = (data = [], range = { min: 0, max: 100 }) => {
  const width = 100;
  const height = 40;

  if (!data || data.length === 0) return `M0,${height / 2} L${width},${height / 2}`;

  const points = data.slice(-10); // Last 10 points
  const step = width / (points.length - 1 || 1);

  return points
    .map((val, i) => {
      const x = i * step;
      const normalized = Math.min(Math.max((val - range.min) / (range.max - range.min || 1), 0), 1);
      // SVG y=0 is top, so we invert it: y = height - (normalized * height)
      // We add a small 2px margin to prevent clipping strokes
      const y = height - 4 - normalized * (height - 8) + 2;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
};
=======
    console.error("[Data Engine Error]: Stats orchestration failed.", error.message);
    return EMPTY_STATE.stats;
  }
};
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
