import { ref, push, serverTimestamp, update, runTransaction } from "firebase/database";
import { auth, db } from "../firebaseConfig";
import { appError } from "../utils/appError";
import { getUserClaims } from "./auth.service";
import { notifySecurityIncident } from "./notification.service";
import { logger } from "../utils/logger";

/**
 * AUDIT SERVICE
 *
 * Handles the recording of administrative and system activities for accountability.
 * Adheres to SOLID principles by focusing strictly on 'Write' operations.
 */

/**
 * INTERNAL GUARD: Verifies SuperAdmin clearance via Token Claims
 */
const verifySuperAdminClearance = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new appError("Authentication required.", true, "auth/unauthorized");

  const claims = await getUserClaims(currentUser);
  if (!claims?.superAdmin) {
    throw new appError(
      "Access Denied: SuperAdmin clearance required for this operation.",
      true,
      "auth/insufficient-clearance"
    );
  }
  return true;
};

/**
 * Logs an administrative activity to the Realtime Database.
 *
 * @param {string} action - The descriptive action performed (e.g., 'user_disabled', 'request_approved').
 * @param {string} targetId - The ID of the affected entity (User UID, Request ID, etc.).
 * @param {string} details - A brief summary or context of the action.
 * @returns {Promise<Object>} - Success confirmation.
 */
export const logActivity = async (action, targetId, details) => {
  const currentUser = auth.currentUser;

  // Requirement: Get current user's email from Auth
  const adminEmail = currentUser?.email || "system@saltwaterelectricity.internal";

  try {
    const auditRef = ref(db, "audit-logs");

    const logEntry = {
      adminEmail,
      action,
      targetId,
      details,
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
      "Activity log failure: Could not save recent changes.",
      true,
      "audit/log-failed"
    );
  }
};

/**
 * Logs and monitors high-priority security incidents.
 * Automatically escalates to a CRITICAL audit log if thresholds are met
 * (e.g., multiple 404s in a short window indicating a directory scan).
 *
 * @param {string} incidentType - Category of incident (e.g. 'PATH_ENUMERATION')
 * @param {string} identifier - Key for tracking (e.g. User UID or IP)
 * @param {Object} context - Metadata about the event
 */
export const logSecurityIncident = async (incidentType, identifier, context) => {
  // Use internal tracking node for pattern detection
  const monitorRef = ref(db, `internal/security_monitoring/${identifier}/${incidentType}`);

  // Protocol: 5 events within 1 minute triggers an escalation
  const ALERT_THRESHOLD = 5;
  const WINDOW_MS = 60000;

  try {
    const { snapshot } = await runTransaction(monitorRef, (current) => {
      const now = Date.now();
      // Reset if no record or window expired
      if (!current || now - current.lastTimestamp > WINDOW_MS) {
        return { count: 1, lastTimestamp: now };
      }
      return {
        ...current,
        count: current.count + 1,
        lastTimestamp: now,
      };
    });

    const data = snapshot.val();

    // ESCALATION: Record formal security incident to audit-logs if pattern is confirmed
    if (data.count >= ALERT_THRESHOLD) {
      const details = `Security escalation: ${data.count} incidents detected within window. Context: ${JSON.stringify(context)}`;

      // 1. Audit Log
      await logActivity(`SECURITY_ALERT/${incidentType}`, identifier, details);

      // 2. Persistent In-App Notification for Admins (EPP Protocol)
      await notifySecurityIncident(incidentType, identifier, details);
    }

    return { success: true, count: data.count };
  } catch (error) {
    // Fail silent for security telemetry to ensure app availability
    logger.error("[Audit Service]: Incident monitoring transaction failed.", error);
    return { success: false };
  }
};

/**
 * Updates an existing audit log entry. (SuperAdmin only)
 */
export const updateAuditLog = async (logId, updatedData) => {
  if (!logId) throw new appError("Log ID required.", true, "audit/invalid-id");

  // 🛡️ SECONDARY ROLE CHECK: Authoritative Token Verification
  await verifySuperAdminClearance();

  // 🛡️ SECURITY: Prevent NoSQL injection by explicitly mapping allowed fields
  const safeUpdate = {
    details: updatedData.details?.toString().trim() || "Manual override",
    action: updatedData.action || "audit_entry_updated",
    updatedAt: serverTimestamp(),
  };

  try {
    const logRef = ref(db, `audit-logs/${logId}`);
    await update(logRef, safeUpdate);
    return { success: true };
  } catch (error) {
    if (error instanceof appError) throw error;
    throw new appError("Failed to modify the audit record.", true, "audit/update-failed");
  }
};

/**
 * Removes an audit log entry. (SuperAdmin only)
 */
export const deleteAuditLog = async (logId) => {
  if (!logId) throw new appError("Log ID required.", true, "audit/invalid-id");

  // 🛡️ SECONDARY ROLE CHECK: Authoritative Token Verification
  await verifySuperAdminClearance();

  try {
    const logRef = ref(db, `audit-logs/${logId}`);
    await update(logRef, null); // Equivalent to remove
    return { success: true };
  } catch (error) {
    if (error instanceof appError) throw error;
    throw new appError("Failed to purge the security log entry.", true, "audit/delete-failed");
  }
};
