import { ref, push, serverTimestamp, onValue, query, limitToLast } from "firebase/database";
import { db } from "../firebaseConfig";
import { appError } from "../utils/appError";
import { logger } from "../utils/logger";

/**
 * NOTIFICATION SERVICE (Alon Standard)
 *
 * Handles the creation and management of in-app notifications for users and administrators.
 * Standardizes on high-visibility 'info', 'warning', and 'critical' types.
 */

export const NOTIFICATION_TYPES = Object.freeze({
  INFO: "info", // Blue
  WARNING: "warning", // Yellow
  CRITICAL: "critical", // Red
});

/**
 * Creates a persistent notification in the Realtime Database.
 *
 * @param {string} userId - Target recipient UID (or 'admin' for global admin alerts).
 * @param {string} title - Brief headline for the alert.
 * @param {string} message - Detailed context of the event.
 * @param {string} type - 'info', 'warning', or 'critical'.
 * @returns {Promise<Object>} - { success, error }
 */
export const createNotification = async (
  userId,
  title,
  message,
  type = NOTIFICATION_TYPES.INFO
) => {
  if (!userId || !title || !message) {
    return {
      success: false,
      error: new appError(
        "Required alert information is missing.",
        true,
        "notification/invalid-data"
      ),
    };
  }

  // Schema Enforcement: Map to valid types
  const validTypes = Object.values(NOTIFICATION_TYPES);
  const finalType = validTypes.includes(type) ? type : NOTIFICATION_TYPES.INFO;

  try {
    const notifyRef = ref(db, `notifications/${userId}`);

    const notificationEntry = {
      title: title.trim(),
      message: message.trim(),
      type: finalType,
      isRead: false,
      timestamp: serverTimestamp(),
    };

    await push(notifyRef, notificationEntry);

    return { success: true, error: null };
  } catch (error) {
    logger.error("[Notification Service]: Failed to write alert.", error);
    return {
      success: false,
      error: new appError(
        "Alert Error: We could not send the notification. Please try again later.",
        true,
        "notification/write-failed"
      ),
    };
  }
};

/**
 * Subscribes to real-time notifications.
 */
export const subscribeToNotifications = (userId, limit, callback, onError = null) => {
  if (!userId) return () => {};

  // 1. Path Selection: 'all' mode for Super Admins, specific node for others
  const isGlobal = userId === "all";
  const notifyRef = ref(db, isGlobal ? "notifications" : `notifications/${userId}`);

  // 2. Query Construction: Limit results to prevent client-side overloading
  const notifyQuery = query(notifyRef, limitToLast(limit));

  return onValue(
    notifyQuery,
    (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
        return;
      }

      let list = [];

      if (isGlobal) {
        // FLAT-MAP STRATEGY: Aggregate notifications across all user keys
        Object.entries(data).forEach(([uid, userAlerts]) => {
          if (typeof userAlerts === "object") {
            Object.entries(userAlerts).forEach(([id, val]) => {
              list.push({
                id,
                ...val,
                targetUid: uid, // Metadata for Super Admin context
              });
            });
          }
        });
      } else {
        // STANDARD STRATEGY: Direct mapping of user-specific alerts
        list = Object.entries(data).map(([id, val]) => ({
          id,
          ...val,
        }));
      }

      // 3. SORTING: Descending order by timestamp (Server or Client generated)
      list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      // 4. TRUNCATION: Ensure the 'all' view doesn't exceed the requested limit after flattening
      callback(list.slice(0, limit));
    },
    (error) => {
      logger.error(`[Notification Service]: Subscription to ${userId} failed.`, error);
      if (onError) onError(error);
    }
  );
};
