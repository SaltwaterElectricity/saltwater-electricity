import { useState, useEffect, useCallback } from "react";
import { getHistoricalLogs } from "../services/reading.service";
import logger from "../utils/logger";

/**
 * Hook: useMultiDeviceHistory
 *
 * Fetches and synchronizes historical telemetry from multiple devices.
 * Aligns data points by timestamp to allow side-by-side comparison in charts.
 *
 * @param {Array<string>} deviceIds - Array of IDs for the devices to compare
 * @param {number} limit - Number of records to fetch per device
 * @param {string} date - Optional date filter (YYYY-MM-DD)
 * @returns {Object} - { data, loading, error, refresh }
 */
export const useMultiDeviceHistory = (deviceIds = [], limit = 30, date = null) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(deviceIds.length > 0);
  const [error, setError] = useState(null);

  const fetchAllHistory = useCallback(async () => {
    if (!deviceIds || deviceIds.length === 0) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Fetch all logs in parallel
      const fetchPromises = deviceIds.map((id) =>
        getHistoricalLogs(id, limit, date)
          .then((logs) => ({ id, logs }))
          .catch((err) => {
            logger.error(`[MultiHistory]: Failed to fetch for ${id}`, err);
            return { id, logs: [] };
          })
      );

      const results = await Promise.all(fetchPromises);

      // 2. Merge and Align Data
      // Strategy: Use a Map keyed by normalized timestamp
      const timeMap = new Map();
      const ALIGNMENT_WINDOW = 10000; // 10 seconds buckets

      results.forEach(({ id, logs }) => {
        logs.forEach((log) => {
          // Normalize timestamp to the nearest bucket
          const ts = Number(log.__normalizedTs || log.timestamp);
          if (isNaN(ts)) return;

          const normalizedTs = Math.round(ts / ALIGNMENT_WINDOW) * ALIGNMENT_WINDOW;

          if (!timeMap.has(normalizedTs)) {
            timeMap.set(normalizedTs, { timestamp: normalizedTs });
          }

          const entry = timeMap.get(normalizedTs);
          // Add device-specific keys
          entry[`${id}_tds`] = Number(log.tds) || 0;
          entry[`${id}_full_${id}`] = {
            ...log,
            timestamp: ts,
          };
        });
      });

      // 3. Convert Map to sorted array (ASCENDING for XAxis)
      const mergedData = Array.from(timeMap.values()).sort((a, b) => a.timestamp - b.timestamp);

      setData(mergedData);
    } catch (err) {
      logger.error("[MultiHistory]: Global fetch failure", err);
      setError(new Error("The comparative data service is currently unavailable."));
    } finally {
      setLoading(false);
    }
  }, [deviceIds, limit, date]);

  useEffect(() => {
    fetchAllHistory();
  }, [fetchAllHistory]);

  return {
    data,
    loading,
    error,
    refresh: fetchAllHistory,
  };
};
