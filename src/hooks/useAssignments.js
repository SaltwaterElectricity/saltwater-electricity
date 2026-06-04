import { useState, useEffect } from "react";
import { subscribeToAssignments } from "../services/device.service";
import { logger } from "../utils/logger";

/**
 * Hook: useAssignments
 * Subscribes to the normalized 'device_assignments' node.
 */
export const useAssignments = () => {
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToAssignments(
      (data) => {
        setAssignments(data);
        setError(null);
        setLoading(false);
      },
      (err) => {
        logger.error("[Assignment Hook]: Subscription error:", err);
        setError(new Error("Communications link interrupted. Please check your network."));
        setLoading(false);
      }
    );

    return () => unsubscribe && unsubscribe();
  }, []);

  return { assignments, loading, error };
};
