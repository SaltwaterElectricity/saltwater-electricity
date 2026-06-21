import { ref, push, serverTimestamp, update } from "firebase/database";
import { auth, db } from "../firebaseConfig";
import { appError } from "../utils/appError";
import { getUserClaims } from "./auth.service";

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
    throw new appError("Access Denied: SuperAdmin clearance required for this operation.", true, "auth/insufficient-clearance");
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
    const auditRef = ref(db, 'audit-logs');
    
    const logEntry = {
      adminEmail,
      action,
      targetId,
      details,
      createdAt: serverTimestamp()
    };

    // Requirement: Use push() to automatically create a unique entry node
    await push(auditRef, logEntry);

    return { success: true };
  } catch (_error) {
    // Mask internal DB errors with operational appError
    throw new appError(
      "Security Audit Failure: Could not record the activity trail.", 
      true, 
      "audit/log-failed"
    );
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
    updatedAt: serverTimestamp()
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

