import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { ref, onValue, query, orderByChild, equalTo } from "firebase/database";
import { appError } from "../utils/appError";
import { logger } from "../utils/logger";
import { transformReading } from "../services/reading.service";

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
    let isMounted = true;
    const devicesRef = ref(db, "device_information");

    const finalQuery = onlyAvailable
      ? query(devicesRef, orderByChild("availability"), equalTo("available"))
      : devicesRef;

    const unsubDevices = onValue(
      finalQuery,
      (snapshot) => {
        if (!isMounted) return;
        try {
          const data = snapshot.val();
          if (!data) {
            setDevices([]);
          } else {
            const deviceList = Object.entries(data).map(([id, val]) => ({
              device_id: id,
              ...val,
            }));
            setDevices(deviceList);
          }
          setError(null);
        } catch {
          setError(new appError("Failed to parse device list.", true, "db/parse-failed"));
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        if (!isMounted) return;
        setError(new appError(err.message, true, err.code || "db/subscription-failed"));
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsubDevices();
    };
  }, [onlyAvailable]);

  // 2. Subscribe to Readings (Mapped to telemetry for UI compatibility)
  useEffect(() => {
    let isMounted = true;
    const telemetryRef = ref(db, "readings");

    const unsubTelemetry = onValue(
      telemetryRef,
      (snapshot) => {
        if (!isMounted) return;
        const readings = snapshot.val() || {};

        // MAPPING: Ensure every known device has a telemetry entry (Default to Standby Zeros)
        const normalizedTelemetry = {};

        // First, initialize all current devices with default standby data
        devices.forEach((device) => {
          normalizedTelemetry[device.device_id] = transformReading(null);
        });

        // Then, overwrite with actual 'latest' data if it exists
        Object.keys(readings).forEach((id) => {
          if (readings[id]?.latest) {
            normalizedTelemetry[id] = transformReading(readings[id].latest);
          }
        });

        setTelemetry(normalizedTelemetry);
      },
      (err) => {
        logger.error("[useDevices] Telemetry Stream Error:", err);
      }
    );

    return () => {
      isMounted = false;
      unsubTelemetry();
    };
  }, [devices]);

  return { devices, telemetry, loading, error };
};
