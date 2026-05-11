import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig'; 
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { appError } from '../utils/appError';

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

  useEffect(() => {
    let isMounted = true;
    const devicesRef = ref(db, 'device_information');
    const telemetryRef = ref(db, 'telemetry');

    const finalQuery = onlyAvailable 
      ? query(devicesRef, orderByChild('availability'), equalTo('available'))
      : devicesRef;

    // 1. Subscribe to Device Information
    const unsubDevices = onValue(finalQuery, (snapshot) => {
      if (!isMounted) return;
      try {
        const data = snapshot.val();
        if (!data) {
          setDevices([]); 
        } else {
          const deviceList = Object.entries(data).map(([id, val]) => ({
            device_id: id, 
            ...val
          }));
          setDevices(deviceList);
        }
        setError(null);
      } catch {
        setError(new appError("Failed to parse device list.", true, "db/parse-failed"));
      } finally {
        setLoading(false);
      }
    }, (err) => {
      if (!isMounted) return;
      setError(new appError(err.message, true, err.code || "db/subscription-failed"));
      setLoading(false);
    });

    // 2. Subscribe to Telemetry
    const unsubTelemetry = onValue(telemetryRef, (snapshot) => {
      if (!isMounted) return;
      setTelemetry(snapshot.val() || {});
    });

    return () => {
      isMounted = false;
      unsubDevices();
      unsubTelemetry();
    };
  }, [onlyAvailable]);

  return { devices, telemetry, loading, error };
};
