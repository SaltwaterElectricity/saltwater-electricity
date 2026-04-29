import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { logger } from '../utils/logger';

/**
 * Hook: useAssignments
 * Subscribes to the normalized 'device_assignments' node.
 */
export const useAssignments = () => {
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const assignmentsRef = ref(db, 'device_assignments');

    const unsubscribe = onValue(assignmentsRef, (snapshot) => {
      if (!isMounted) return;
      try {
        setAssignments(snapshot.val() || {});
        setError(null);
      } catch (err) {
        logger.error("Error fetching assignments:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }, (err) => {
      if (!isMounted) return;
      logger.error("Assignment subscription error:", err);
      setError(err);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { assignments, loading, error };
};
