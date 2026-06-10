import {
  ref,
  push,
  get,
  serverTimestamp,
  onValue,
  query,
  limitToLast,
  orderByChild,
} from "firebase/database";
import { auth, db } from "../firebaseConfig";
import { appError } from "../utils/appError";
import { logger } from "../utils/logger";

/**
 * AUDIT SERVICE
 *
 * Handles the recording of administrative and system activities for accountability.
 * Adheres to SOLID principles by focusing strictly on 'Write' operations.
 * IMMUTABILITY: All logs are write-only. Edit and delete operations are prohibited.
 */

/**
 * Logs an administrative activity to the Realtime Database.
 *
 * @param {string} action - The descriptive action performed (e.g., 'user_disabled', 'request_approved').
 * @param {string} targetId - The ID of the affected entity (User UID, Request ID, etc.).
 * @param {string} details - A brief summary or context of the action.
 * @param {Object} options - Optional parameters: { actorUid, status, severity }
 * @returns {Promise<Object>} - Success confirmation.
 */
export const logActivity = async (
  action,
  targetId,
  details,
  { actorUid = null, status = "success", severity = "informational" } = {}
) => {
  const currentUser = auth.currentUser;
  const effectiveUid = actorUid || currentUser?.uid;

  // Requirement: Get current user's email from Auth
  const adminEmail = currentUser?.email || "system@saltwaterelectricity.internal";

  try {
    const auditRef = ref(db, "audit-logs");

    let firstName = "";
    let lastName = "";
    let adminName = "System";
    let role = "System";

    // Use the effective UID to fetch profile and role data (handles login/logout races)
    if (effectiveUid && effectiveUid !== "unauthenticated") {
      try {
        const [userSnap, roleSnap] = await Promise.all([
          get(ref(db, `users/${effectiveUid}`)),
          get(ref(db, `roles/${effectiveUid}`)),
        ]);

        if (userSnap.exists()) {
          const userData = userSnap.val();
          // Requirement: Use explicit property names from the database schema
          firstName = (userData.firstName || "").trim();
          lastName = (userData.lastName || "").trim();
          const fullName = `${firstName} ${lastName}`.trim();
          adminName = fullName || userData.userName || userData.email?.split("@")[0] || "User";
        }

        if (roleSnap.exists()) {
          role = roleSnap.val().role || "User";
        }
      } catch (err) {
        logger.warn(`[Audit Service] Failed to fetch identity for UID: ${effectiveUid}`, err);
      }
    }

    const logEntry = {
      adminEmail,
      adminName,
      firstName,
      lastName,
      role,
      actorUid: effectiveUid,
      action,
      targetId,
      details,
      status,
      severity,
      ipAddress: "Terminal Client", // Requirement: Technical context
      createdAt: serverTimestamp(),
    };

    // Requirement: Use push() to automatically create a unique entry node
    await push(auditRef, logEntry);

    return { success: true };
  } catch (error) {
    // SECURITY: Log the detailed error internally
    logger.error("[Audit Service]: Activity logging failed.", error);

    // Mask internal DB errors with operational appError
    throw new appError(
      "The activity log is currently unavailable. We could not save your recent changes.",
      true,
      "audit/log-failed"
    );
  }
};

/**
 * LOGGING HELPER: Records successful user login.
 */
export const logLoginSuccess = async (email, uid) => {
  return await logActivity("USER_LOGIN", uid, `Session established successfully for ${email}.`, {
    actorUid: uid,
    severity: "low",
  });
};

/**
 * LOGGING HELPER: Records failed login attempts.
 */
export const logLoginFailure = async (email, reason = "Invalid credentials") => {
  return await logActivity(
    "LOGIN_FAILURE",
    "unauthenticated",
    `Failed login attempt for ${email}. Reason: ${reason}`,
    { status: "failed", severity: "medium" }
  );
};

/**
 * LOGGING HELPER: Records user logout.
 */
export const logLogout = async (email, uid) => {
  if (!email || !uid) return;
  return await logActivity("USER_LOGOUT", uid, `Session terminated by user ${email}.`, {
    actorUid: uid,
    severity: "low",
  });
};

/**
 * Subscribes to audit logs with a limit.
 */
export const subscribeToAuditLogs = (limit, callback, onError = null) => {
  const logsRef = ref(db, "audit-logs");
  const logsQuery = query(logsRef, orderByChild("createdAt"), limitToLast(limit));

  return onValue(
    logsQuery,
    (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
      } else {
        const logList = Object.entries(data).map(([id, val]) => ({
          id,
          ...val,
        }));
        // Sort descending to show latest first
        logList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        callback(logList);
      }
    },
    onError
  );
};
