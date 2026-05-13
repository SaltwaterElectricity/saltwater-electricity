import { useState, useEffect } from 'react';
import { subscribeToDeviceLogs } from '../../services/firebaseService';
import { useIsConnected } from '../useIsConnected';

/**
 * HOOK: useDeviceLogs
 * Responsibility: Real-time Firebase data acquisition.
 * Features: Error tracking, Skeleton-ready loading states, and state isolation.
 */
export const useDeviceLogs = (mac, limit = 50, startDate = null) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // New error state
  const isConnected = useIsConnected();

  useEffect(() => {
    // 1. Reset State: Clear everything when MAC changes to avoid "Ghost Data"
    setError(null);
    setLogs([]);
    
    if (!mac) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    // Define a cleanup variable for the subscription
    let unsubscribe = () => {};

    try {
      // 2. Subscription with Error Handling
      // We wrap the call itself in try/catch for immediate connection issues
      unsubscribe = subscribeToDeviceLogs(
        mac, 
        limit, 
        (data) => {
          const incomingData = Array.isArray(data) ? data : [];
          setLogs([...incomingData]);
          setLoading(false);
          setError(null); // Clear any previous errors on success
        }, 
        startDate,
        (err) => {
          // Callback for Firebase-specific errors (permissions, quota, etc.)
          console.error("[Firebase Stream Error]:", err);
          setError("Failed to sync with device. Check permissions.");
          setLoading(false);
        }
      );
      
    } catch (err) {
      // Catch synchronous setup errors
      console.error("[Subscription Setup Error]:", err);
      setError("Connection setup failed.");
      setLoading(false);
    }

    // 3. Cleanup: Sever the link to prevent memory leaks
    return () => unsubscribe();
  }, [mac, limit, startDate]);

  return { 
    logs, 
    loading, 
    error, // Exposed for UI Alerts
    isReconnecting: !isConnected 
  };
};