import { useState, useEffect } from "react";
import { subscribeToAuditLogs } from "../services/audit.service";
import logger from "../utils/logger";

/**
 * Hook: useAuditLogs
 * Subscribes to the system audit logs with a limit to maintain performance.
 *
 * @param {number} limit - Maximum number of recent logs to retrieve. Defaults to 100.
 * @returns {Object} - { logs, loading, error }
 */
export const useAuditLogs = (limit = 100) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuditLogs(
      limit,
      (logList) => {
        setLogs(logList);
        setError(null);
        setLoading(false);
      },
      (err) => {
        logger.error("[Audit Hook]: Subscription failed.", err);
        setError(new Error("Security Monitor: Lost connection to the audit trail."));
        setLoading(false);
      }
    );

    return () => unsubscribe && unsubscribe();
  }, [limit]);

  return { logs, loading, error };
};
