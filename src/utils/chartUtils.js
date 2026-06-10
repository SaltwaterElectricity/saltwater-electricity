/**
 * src/utils/chartUtils.js
 * High-Performance Data Engine for SMARTAQUA Dashboard.
 */
import { logger } from "./logger";
import { APP_SETTINGS } from "../constants";

// --- 1. HELPER: Data Sanitization ---
/**
 * Ensures we only deal with numbers or nulls for chart stability.
 * Note: useSortedLogs handles the bulk cleaning; this handles specific metric extraction.
 */
const normalizeSensorValue = (val) => {
  if (val === undefined || val === null || val === "") return null;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? null : parsed;
};

// --- 2. PROCESSOR: Time-Series Segmentation ---
/**
 * Segments logs into current and previous windows for trend analysis.
 * UPDATED: Optimized to utilize __normalizedTs provided by useSortedLogs.
 */
export const processLogsInWindows = (
  sortedLogs = [],
  {
    metricKey,
    metricId,
    currentWindowStart = Date.now(),
    comparisonWindowStart = Date.now() - 3600000,
  } = {}
) => {
  // Guard Clause: Prevent processing without essential identifiers
  if (!metricKey || !metricId) {
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
  const now = Date.now();

  for (const entry of sortedLogs) {
    // Optimization: Prioritize the pre-normalized timestamp from useSortedLogs
    const ts = entry.__normalizedTs || entry.timestamp;
    if (!ts) continue;

    // Safety: Skip future logs and logs outside our comparison range
    // We break because sortedLogs is guaranteed to be chronological by useSortedLogs
    if (ts > now + 5000) break;
    if (ts < comparisonWindowStart) continue;

    const val = normalizeSensorValue(entry[metricKey]);

    if (ts < currentWindowStart) {
      // Historical baseline collection
      if (val !== null) {
        result.previous.push({ ...entry, value: val });
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
        });
      }

      result.current.push({ ...entry, timestamp: ts, value: val });
      if (val !== null) result.currentValues.push(val);

      result.lastTs = ts;
    }
  }

  return result;
};
