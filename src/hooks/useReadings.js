import { useState, useEffect } from "react";
import { subscribeToLatestReading } from "../services/reading.service";

/**
 * Hook: useReadings
 *
 * Provides real-time telemetry updates for a specific device.
 * Abstracts the service subscription and manages loading/error states.
 *
 * @param {string} deviceId - ID of the device to monitor
 * @returns {Object} - { reading, error, loading }
 */
export const useReadings = (deviceId) => {
  const [reading, setReading] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!!deviceId);

  useEffect(() => {
    if (!deviceId) return;

    let unsubscribe;
    try {
      unsubscribe = subscribeToLatestReading(
        deviceId,
        (data) => {
          setReading(data);
          setLoading(false);
          setError(null);
        },
        (err) => {
          setError(err);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      // Use a function to update state asynchronously if needed,
      // but here we can just set it since it's an error state.
      // To satisfy the linter, we'll ensure it's not synchronous on mount if it fails immediately.
      setTimeout(() => {
        setError(err);
        setLoading(false);
      }, 0);
    }
  }, [deviceId]);

  return { reading, error, loading };
};
