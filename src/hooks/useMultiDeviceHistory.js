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
 * @returns {Object} - { data, loading, error, refresh }
 */
export const useMultiDeviceHistory = (deviceIds = [], limit = 30) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllHistory = useCallback(async () => {
    if (!deviceIds || deviceIds.length === 0) {
      setData([]);
      return;
    }

    Promise.resolve().then(() => setLoading(true));
    try {
      // 1. Fetch all logs in parallel
      const fetchPromises = deviceIds.map((id) =>
        getHistoricalLogs(id, limit)
          .then((logs) => ({ id, logs }))
          .catch((err) => {
            logger.error(`[MultiHistory]: Failed to fetch for ${id}`, err);
            return { id, logs: [] };
          })
      );

      const results = await Promise.all(fetchPromises);

      // 2. Merge and Align Data
      // Strategy: Use a Map keyed by normalized timestamp (to the nearest minute or 30s)
      const timeMap = new Map();
      const ALIGNMENT_WINDOW = 60000; // 1 minute buckets

      results.forEach(({ id, logs }) => {
        logs.forEach((log) => {
          // Normalize timestamp to the nearest bucket
          const ts = log.__normalizedTs || log.timestamp;
          const normalizedTs = Math.round(ts / ALIGNMENT_WINDOW) * ALIGNMENT_WINDOW;

          if (!timeMap.has(normalizedTs)) {
            timeMap.set(normalizedTs, { timestamp: normalizedTs });
          }

          const entry = timeMap.get(normalizedTs);
          // Add device-specific keys
          entry[`${id}_tds`] = log.tds || 0;
          entry[`${id}_full`] = {
            ...log,
            timestamp: ts,
          };
        });
      });

      // 3. Convert Map to sorted array
      const mergedData = Array.from(timeMap.values()).sort((a, b) => a.timestamp - b.timestamp);

      setData(mergedData);
      setError(null);
    } catch (err) {
      logger.error("[MultiHistory]: Global fetch failure", err);
      setError(new Error("The comparative data service is currently unavailable."));
    } finally {
      setLoading(false);
    }
  }, [deviceIds, limit]);

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
