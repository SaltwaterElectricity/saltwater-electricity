import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { ref, onValue, query, limitToLast, orderByKey } from 'firebase/database';

/**
 * Hook: useChartLogs
 * Manages real-time historical logs for a specific device.
 */
export const useChartLogs = (deviceId, limit = 50) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deviceId) return;

    const logsRef = query(
      ref(db, `logs/${deviceId}`),
      orderByKey(),
      limitToLast(limit)
    );

    const unsubscribe = onValue(logsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Firebase keys are often timestamps or push IDs (which are chronological)
        const sortedList = Object.entries(data).map(([key, val]) => ({
          id: key,
          ...val,
          __normalizedTs: val.timestamp || parseInt(key) || Date.now()
        }));
        setLogs(sortedList);
      } else {
        setLogs([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [deviceId, limit]);

  return { logs, loading };
};