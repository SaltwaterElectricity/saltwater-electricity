import { useState, useEffect } from 'react';
import { ref, onValue, query, limitToLast } from 'firebase/database';
import { db } from '../firebaseConfig';
import { logger } from '../utils/logger';

/**
 * useNotifications Hook
 * 
 * Streams real-time notifications from Firebase RTDB for a specific user.
 * 
 * @param {string} userId - The unique identifier of the user (or 'admin' for system-wide alerts).
 * @param {number} limit - Maximum number of recent notifications to retrieve.
 */
export const useNotifications = (userId, limit = 50) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const notifyRef = ref(db, `notifications/${userId}`);
    const notifyQuery = query(notifyRef, limitToLast(limit));

    const unsubscribe = onValue(notifyQuery, (snapshot) => {
      if (!isMounted) return;

      try {
        const data = snapshot.val();
        if (!data) {
          setNotifications([]);
        } else {
          // Transform object into a chronological array (descending)
          const list = Object.entries(data).map(([id, val]) => ({
            id,
            ...val
          })).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

          setNotifications(list);
        }
        setError(null);
      } catch (err) {
        logger.error("[useNotifications] Parse Error:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }, (err) => {
      if (!isMounted) return;
      logger.error("[useNotifications] Stream Error:", err);
      setError(err);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [userId, limit]);

  return { notifications, loading, error };
};