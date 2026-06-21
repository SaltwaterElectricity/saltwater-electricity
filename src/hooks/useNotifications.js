import { useState, useEffect } from "react";
import { subscribeToNotifications } from "../services/notification.service";
import { logger } from "../utils/logger";

/**
 * useNotifications Hook
 *
 * Streams real-time notifications for a specific user.
 *
 * @param {string} userId - The unique identifier of the user (or 'admin' for system-wide alerts, or 'all' for super admin global feed).
 * @param {number} limit - Maximum number of recent notifications to retrieve.
 */
export const useNotifications = (userId, limit = 50) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(!!userId);
  const [error, setError] = useState(null);

  const [prevUserId, setPrevUserId] = useState(userId);
  if (userId !== prevUserId) {
    setPrevUserId(userId);
    setNotifications([]);
    setLoading(!!userId);
    setError(null);
  }

  useEffect(() => {
    if (!userId) {
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
