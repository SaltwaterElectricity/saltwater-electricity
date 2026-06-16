import { useState, useEffect, useCallback } from "react";
import { getHistoricalLogs } from "../services/reading.service";
import logger from "../utils/logger";

/**
 * Hook: useResidentHistory
 *
 * Fetches and merges historical logs from multiple devices assigned to a resident.
 *
 * @param {Array<string>} deviceIds - List of device IDs
 * @param {number} limit - Records per device
 * @param {string} date - Optional date filter (YYYY-MM-DD)
 */
export const useResidentHistory = (deviceIds = [], limit = 50, date = null) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(deviceIds.length > 0);
  const [error, setError] = useState(null);

  const fetchAllLogs = useCallback(async () => {
    if (!deviceIds || deviceIds.length === 0) {
      setLogs([]);
      setLoading(false);
      return;
    }

    Promise.resolve().then(() => {
      setLoading(true);
      // 🛡️ STALE DEFENSE: Clear logs when the date filter changes to prevent 'ghost' data
      setLogs([]);
    });
    try {
      const fetchPromises = deviceIds.map((id) =>
        getHistoricalLogs(id, limit, date).catch((err) => {
          logger.error(`[ResidentHistory]: Failed for ${id}`, err);
          return [];
        })
      );

      const results = await Promise.all(fetchPromises);

      // Merge all logs and sort by timestamp descending
      const merged = results.flat().sort((a, b) => {
        const tsA = a.__normalizedTs || a.timestamp;
        const tsB = b.__normalizedTs || b.timestamp;
        return tsB - tsA;
      });

      setLogs(merged);
      setError(null);
    } catch (err) {
      logger.error("[ResidentHistory]: Global fetch failure", err);
      setError(new Error("The historical data service is currently unavailable."));
    } finally {
      setLoading(false);
    }
  }, [deviceIds, limit, date]);

  useEffect(() => {
    fetchAllLogs();
  }, [fetchAllLogs]);

  return { logs, loading, error, refresh: fetchAllLogs };
};
