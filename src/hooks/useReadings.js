import { useState, useEffect } from "react";
import { subscribeToLatestReading } from "../services/reading.service";
import { logger } from "../utils/logger";

/**
 * Hook: useReadings
 *
 * Provides real-time telemetry updates for a specific device.
 * IMPLEMENTS: Visibility-Aware Smart Subscription (Adaptive Polling Hybrid)
 * - Automatically unsubscribes when tab is hidden to save resources.
 * - Automatically resubscribes when tab is focused for fresh data.
 *
 * @param {string} deviceId - ID of the device to monitor
 * @returns {Object} - { reading, error, loading }
 */
export const useReadings = (deviceId) => {
  const [reading, setReading] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!!deviceId);
  const [isVisible, setIsVisible] = useState(!document.hidden);

  // 1. VISIBILITY LISTENER
  useEffect(() => {
    const handleVisibilityChange = () => {
      const hidden = document.hidden;
      setIsVisible(!hidden);
      if (hidden) {
        logger.debug(`[useReadings]: Tab hidden. Pausing subscription for ${deviceId}`);
      } else {
        logger.debug(`[useReadings]: Tab focused. Resuming subscription for ${deviceId}`);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [deviceId]);

  // 2. SMART SUBSCRIPTION LOGIC
  useEffect(() => {
    if (!deviceId || !isVisible) {
      if (!isVisible) setLoading(false); // Stop spinner if hidden
      return;
    }

    let unsubscribe;
    try {
      setLoading(true);
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

      return () => {
        if (unsubscribe) {
          logger.debug(`[useReadings]: Cleaning up subscription for ${deviceId}`);
          unsubscribe();
        }
      };
    } catch (err) {
      setTimeout(() => {
        setError(err);
        setLoading(false);
      }, 0);
    }
  }, [deviceId, isVisible]);

  return { reading, error, loading };
};
