import { useState, useEffect } from "react";
import { subscribeToDeviceRequests } from "../services/request.service";
import { appError } from "../utils/appError";

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
    const unsubscribe = subscribeToDeviceRequests(
      userId,
      (requestList) => {
        setRequests(requestList);
        setError(null);
        setLoading(false);
      },
      (err) => {
        // Mask internal errors with descriptive appError
        const wrappedError = new appError(
          "Could not sync with the request service. Please check your connection.",
          true,
          err.code || "db/subscription-failed"
        );

        setError(wrappedError);
        setLoading(false);
      }
    );

    return () => unsubscribe && unsubscribe();
  }, [userId]);

  return { requests, loading, error };
};
