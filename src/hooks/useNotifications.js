import { useState, useEffect } from 'react';
import { subscribeToNotifications } from '../services/notification.service';
import { logger } from '../utils/logger';

/**
 * useNotifications Hook
 * 
 * Streams real-time notifications for a specific user.
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
      Promise.resolve().then(() => {
        setNotifications([]);
        setLoading(false);
      });
      return;
    }

    const unsubscribe = subscribeToNotifications(
      userId,
      limit,
      (list) => {
        setNotifications(list);
        setError(null);
        setLoading(false);
      },
      (err) => {
        logger.error("[useNotifications] Stream Error:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe && unsubscribe();
  }, [userId, limit]);

  return { notifications, loading, error };
};