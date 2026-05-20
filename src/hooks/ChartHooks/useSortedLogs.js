import { useMemo } from 'react';

const normalizeTS = (ts) => (typeof ts === 'string' ? new Date(ts).getTime() : ts);

/**
 * Focus: PURE DATA SANITIZATION
 * Responsibility: Sorts logs, normalizes timestamps, and filters out corrupted entries.
 */
export const useSortedLogs = (logs, maxEntries = 1000) => {
  return useMemo(() => {
    // Safety Check: Handle null/undefined/objects
    const rawLogs = Array.isArray(logs) ? logs : Object.values(logs ?? {});
    
    if (rawLogs.length === 0) {
      return { data: [], hasData: false };
    }

    try {
      // 1. Clean and Normalize in a single pass
      const cleaned = rawLogs
        .filter(log => {
          // Rule: Ignore logs missing a timestamp or "Blackout" logs (both 0)
          const hasTs = !!log.timestamp;
          const isNotBlackout = (log.tds_ppm ?? 0) !== 0;
          return hasTs && isNotBlackout;
        })
        .map(log => ({
          ...log,
          // Attach normalized timestamp once here to save CPU later
          __normalizedTs: normalizeTS(log.timestamp)
        }))
        // 2. Sort by time (Absolute requirement for the Windowing logic)
        .sort((a, b) => a.__normalizedTs - b.__normalizedTs)
        // 3. Performance Cap
        .slice(-maxEntries);

      return {
        data: cleaned,
        hasData: cleaned.length > 0
      };
        
    } catch (e) {
      console.error("[Sanitizer Error]:", e);
      return { data: [], hasData: false };
    }
  }, [logs, maxEntries]);
};