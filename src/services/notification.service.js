import { ref, push, serverTimestamp } from "firebase/database";
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
  INFO: "info",         // Blue
  WARNING: "warning",   // Yellow
  CRITICAL: "critical"  // Red
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
export const createNotification = async (userId, title, message, type = NOTIFICATION_TYPES.INFO) => {
  if (!userId || !title || !message) {
    return { 
      success: false, 
      error: new appError("Incomplete notification parameters.", true, "notification/invalid-data") 
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
      timestamp: serverTimestamp()
    };

    await push(notifyRef, notificationEntry);

    return { success: true, error: null };
  } catch (error) {
    logger.error("[Notification Service]: Failed to write alert.", error);
    return { 
      success: false, 
      error: new appError("Notification failure: Could not deliver the alert.", true, "notification/write-failed") 
    };
  }
};

/**
 * Specifically logs notifications for security escalations.
 * Part of the Enumeration Prevention Protocol (EPP).
 */
export const notifySecurityIncident = async (incidentType, identifier, details) => {
  return await createNotification(
    "admin", // Escalate to administrative dashboard
    "Security Alert: Detection Node",
    `EPP Triggered: ${incidentType} detected for identifier ${identifier}. ${details}`,
    NOTIFICATION_TYPES.CRITICAL
  );
};
