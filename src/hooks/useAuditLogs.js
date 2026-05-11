import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { ref, onValue, query, limitToLast, orderByChild } from "firebase/database";
import { appError } from "../utils/appError";

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
    let isMounted = true;

    // 1. Reference and Query Configuration
    // We order by 'createdAt' and take the last N entries
    const logsRef = ref(db, "audit-logs");
    const logsQuery = query(logsRef, orderByChild("createdAt"), limitToLast(limit));

    // 2. Real-time Subscription
    const unsubscribe = onValue(
      logsQuery,
      (snapshot) => {
        if (!isMounted) return;

        try {
          const data = snapshot.val();
          if (!data) {
            setLogs([]);
          } else {
            // Transform object into an array and inject IDs
            const logList = Object.entries(data).map(([id, val]) => ({
              id,
              ...val,
            }));

            // 3. Sorting: Firebase limitToLast returns them in ascending order of the key/index.
            // We sort them descending to show the latest first as per requirements.
            logList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

            setLogs(logList);
          }
          setError(null);
        } catch {
          setError(
            new appError(
              "Data Stream Error: Failed to process audit records.",
              true,
              "audit/parse-error"
            )
          );
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        if (!isMounted) return;

        const wrappedError = new appError(
          "Security Monitor: Lost connection to the audit trail.",
          true,
          err.code || "audit/subscription-failed"
        );

        setError(wrappedError);
        setLoading(false);
      }
    );

    // 4. Cleanup
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [limit]);

  return { logs, loading, error };
};
