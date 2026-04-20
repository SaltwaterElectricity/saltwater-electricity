import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig'; 
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { appError } from '../utils/appError';

/**
 * useDevices
 * @param {boolean} onlyAvailable - Kung true, 'idle' devices lang ang kukunin.
 */
export const useDevices = (onlyAvailable = false) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    // 1. Reference Selection
    // Gamitin ang path na consistent sa ESP32 code mo: 'device_information'
    const devicesRef = ref(db, 'device_information');
    
    // 2. Query Logic
    // Kung onlyAvailable ay true, i-filter natin sa server-side ang 'idle' status
    const finalQuery = onlyAvailable 
      ? query(devicesRef, orderByChild('availability'), equalTo('available'))
      : devicesRef;

    // 3. Real-time Subscription
    const unsubscribe = onValue(finalQuery, (snapshot) => {
      if (!isMounted) return;

      try {
        const data = snapshot.val();
        
        if (!data) {
          setDevices([]); 
        } else {
          // Transformation: Gamit ang Object.entries para sa mas malinis na conversion
          const deviceList = Object.entries(data).map(([id, val]) => ({
            id, 
            ...val
          }));
          setDevices(deviceList);
        }
        setError(null);
      } catch (err) {
        console.error("RTDB Processing Error:", err);
        setError(new appError("Failed to parse device list.", true, "db/parse-failed"));
      } finally {
        setLoading(false);
      }
    }, (err) => {
      if (!isMounted) return;
      setError(new appError(err.message, true, err.code || "db/subscription-failed"));
      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [onlyAvailable]); // Re-run kung nagbago ang filter mode

  return { devices, loading, error };
};
