import { useState, useEffect, useCallback } from "react";
import { getHistoricalLogs } from "../services/reading.service";

/**
 * Hook: useHistory
 *
 * Fetches and manages historical telemetry logs for a specific device.
 * Uses the reading.service for standardized data fetching and transformation.
 *
 * @param {string} deviceId - ID of the device to fetch history for
 * @param {number} limit - Max number of records to retrieve (ignored if date is provided)
 * @param {string} date - Optional. Filter logs by date (YYYY-MM-DD)
 * @returns {Object} - { logs, error, loading, refresh }
 */
export const useHistory = (deviceId, limit = 50, date = null) => {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!!deviceId);

  const fetchHistory = useCallback(async () => {
    if (!deviceId) return;

    Promise.resolve().then(() => setLoading(true));
    try {
      const data = await getHistoricalLogs(deviceId, limit, date);
      setLogs(data);
      setError(null);
    } catch (err) {
      // SECURITY: Logs technical details internally
      console.error("[History Hook]: Fetch failure.", err);

      // UX: Human-first generic message
      setError(new Error("The historical data service is currently unavailable."));
    } finally {
      setLoading(false);
    }
  }, [deviceId, limit, date]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    logs,
    error,
    loading,
    refresh: fetchHistory,
  };
};
