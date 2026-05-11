import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { appError } from '../utils/appError';

/**
 * Hook: useDeviceRequests
 * Subscribes to real-time updates for device requests.
 * 
 * @param {string} userId - Optional. If provided, filters by userId. Otherwise fetches all.
 * @returns {Object} - { requests, loading, error }
 */
export const useDeviceRequests = (userId = null) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const requestsRef = ref(db, 'device-requests');
    
    // If userId is provided, filter. Otherwise fetch all.
    const finalQuery = userId 
      ? query(requestsRef, orderByChild('userId'), equalTo(userId))
      : requestsRef;

    const unsubscribe = onValue(finalQuery, (snapshot) => {
      if (!isMounted) return;
      
      try {
        const data = snapshot.val();
        if (!data) {
          setRequests([]);
        } else {
          // Transform object into an array with IDs for easy mapping
          const requestList = Object.entries(data).map(([id, val]) => ({
            id,
            ...val
          }));
          
          // Optional: Sort by createdAt descending if needed by the UI
          requestList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          
          setRequests(requestList);
        }
        setError(null);
      } catch {
        setError(new appError("Failed to parse the request list.", true, "db/parse-failed"));
      } finally {
        setLoading(false);
      }
    }, (err) => {
      if (!isMounted) return;
      
      // Mask internal errors with descriptive appError
      const wrappedError = new appError(
        "Could not sync with the request service. Please check your connection.",
        true,
        err.code || "db/subscription-failed"
      );
      
      setError(wrappedError);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [userId]);

  return { requests, loading, error };
};
