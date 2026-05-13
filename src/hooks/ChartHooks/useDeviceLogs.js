import { useState, useEffect } from "react";
import { subscribeToDeviceLogs } from "../../services/firebaseService";
import { useIsConnected } from "../useIsConnected";

/**
 * HOOK: useDeviceLogs
 * Responsibility: Real-time Firebase data acquisition.
 * Features: Error tracking, Skeleton-ready loading states, and state isolation.
 */
export const useDeviceLogs = (mac, limit = 50, startDate = null) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(!!mac);
  const [error, setError] = useState(null);
  const isConnected = useIsConnected();

  // Pattern: Adjusting state when a prop changes (Derived State)
  // This avoids calling setState inside useEffect which triggers cascading renders.
  const [prevMac, setPrevMac] = useState(mac);
  if (mac !== prevMac) {
    setLogs([]);
    setError(null);
    setLoading(true);
    setPrevMac(mac);
  }

  useEffect(() => {
    if (!mac) {
      return;
    }

    // Define a cleanup variable for the subscription
    let unsubscribe = () => {};

    try {
      // 2. Subscription with Error Handling
      unsubscribe = subscribeToDeviceLogs(
        mac,
        limit,
        (data) => {
          const incomingData = Array.isArray(data) ? data : [];
          setLogs([...incomingData]);
          setLoading(false);
          setError(null);
        },
        startDate,
        (err) => {
          // Firebase errors are already asynchronous callbacks, so this is safe.
          console.error("[Firebase Stream Error]:", err);
          setError("Failed to sync with device. Check permissions.");
          setLoading(false);
        }
      );
    } catch (err) {
      // Synchronous errors during setup must be handled asynchronously to avoid
      // "set-state-in-effect" lint errors in strict environments.
      console.error("[Subscription Setup Error]:", err);
      Promise.resolve().then(() => {
        setError("Connection setup failed.");
        setLoading(false);
      });
    }

    return () => unsubscribe();
  }, [mac, limit, startDate]);

  return {
    logs,
    loading,
    error,
    isReconnecting: !isConnected,
  };
};
