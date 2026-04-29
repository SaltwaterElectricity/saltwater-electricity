import { useState, useEffect, useCallback } from "react";
import { getHistoricalLogs } from "../services/reading.service";

/**
 * Hook: useHistory
 * 
 * Fetches and manages historical telemetry logs for a specific device.
 * Uses the reading.service for standardized data fetching and transformation.
 * 
 * @param {string} deviceId - ID of the device to fetch history for
 * @param {number} limit - Max number of records to retrieve
 * @returns {Object} - { logs, error, loading, refresh }
 */
export const useHistory = (deviceId, limit = 50) => {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!!deviceId);

  const fetchHistory = useCallback(async () => {
    if (!deviceId) return;
    
    setLoading(true);
    try {
      const data = await getHistoricalLogs(deviceId, limit);
      setLogs(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [deviceId, limit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { 
    logs, 
    error, 
    loading, 
    refresh: fetchHistory 
  };
};
