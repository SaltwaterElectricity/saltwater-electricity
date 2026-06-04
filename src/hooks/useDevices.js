import { useState, useEffect } from "react";
import { subscribeToDevices } from "../services/device.service";
import { subscribeToAllTelemetry } from "../services/reading.service";
import { appError } from "../utils/appError";
import { logger } from "../utils/logger";

/**
 * Hook: useDevices
 * Orchestrates device data retrieval.
 * @param {boolean} onlyAvailable - Filter for 'available' status.
 */
export const useDevices = (onlyAvailable = false) => {
  const [devices, setDevices] = useState([]);
  const [telemetry, setTelemetry] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Subscribe to Device Information
  useEffect(() => {
    const unsubscribe = subscribeToDevices(
      onlyAvailable,
      (deviceList) => {
        setDevices(deviceList);
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(new appError(err.message, true, err.code || "db/subscription-failed"));
        setLoading(false);
      }
    );

    return () => unsubscribe && unsubscribe();
  }, [onlyAvailable]);

  // 2. Subscribe to Readings
  useEffect(() => {
    const unsubscribe = subscribeToAllTelemetry(
      devices.map(d => d.device_id),
      (normalizedTelemetry) => {
        setTelemetry(normalizedTelemetry);
      },
      (err) => {
        logger.error("[useDevices] Telemetry Stream Error:", err);
      }
    );

    return () => unsubscribe && unsubscribe();
  }, [devices]);

  return { devices, telemetry, loading, error };
};
