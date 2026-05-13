import { ref, push, serverTimestamp, update } from "firebase/database";
import { auth, db } from "../firebaseConfig";
import { appError } from "../utils/appError";
import logger from "../utils/logger";
import { getUserClaims } from "./auth.service";
import { logActivity } from "./audit.service";

/**
 * REQUEST SERVICE
 *
 * Handles the creation and management of device-related requests.
 * Adheres to SOLID principles by focusing strictly on request 'Write' operations.
 */

/**
 * INTERNAL GUARD: Verifies Admin clearance via Token Claims
 */
const verifyAdminClearance = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new appError("Authentication required.", true, "auth/unauthorized");

  const claims = await getUserClaims(currentUser);
  if (!claims?.admin && !claims?.superAdmin) {
    throw new appError(
      "Access Denied: Administrative clearance required for this operation.",
      true,
      "auth/insufficient-clearance"
    );
  }
  return true;
};

/**
 * Creates a new device request in the Realtime Database.
 *
 * @param {Object} deviceData - Data containing request details (requestType, deviceName).
 * @returns {Promise<Object>} - The created request reference information.
 */
export const createDeviceRequest = async (deviceData) => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new appError(
      "User identification is required to submit a request. Please log in.",
      true,
      "request/missing-auth"
    );
  }

  const userId = currentUser.uid;

  if (!deviceData?.requestType || !deviceData?.deviceName) {
    throw new appError(
      "Incomplete request data. Please provide both request type and device name.",
      true,
      "request/incomplete-data"
    );
  }

  try {
    const requestRef = ref(db, "device-requests");

    const newRequest = {
      userId,
      requestType: deviceData.requestType,
      deviceName: deviceData.deviceName.trim(),
      status: "pending",
      deviceId: null,
      deviceAssignId: null,
      createdAt: serverTimestamp(),
    };

    const result = await push(requestRef, newRequest);

    return {
      success: true,
      requestId: result.key,
    };
  } catch (error) {
    if (error instanceof appError) throw error;

    // SECURITY: Log technical details internally
    logger.error("[Request Service]: Creation failed.", error);

    // Wrap Firebase errors in a descriptive operational appError
    throw new appError(
      "The request service is currently unavailable. Please try again later.",
      true,
      "request/submission-failed"
    );
  }
};

/**
 * Updates the status of a device request and logs the action in the system audit.
 *
 * @param {string} requestId - The ID of the request to update.
 * @param {string} status - The new status ('approved', 'declined').
 * @param {Object} extraData - Additional data (deviceId, deviceAssignId, reason, adminId).
 */
export const updateRequestStatus = async (requestId, status, extraData = {}) => {
  if (!requestId || !status) {
    throw new appError(
      "Request ID and status are required for this operation.",
      true,
      "request/invalid-parameters"
    );
  }

  // 🛡️ SECONDARY ROLE CHECK: Authoritative Token Verification
  await verifyAdminClearance();

  const updates = {};
  const now = serverTimestamp();

  // 1. Update Request Node
  updates[`/device-requests/${requestId}/status`] = status;
  updates[`/device-requests/${requestId}/updatedAt`] = now;

  if (status === "approved") {
    updates[`/device-requests/${requestId}/deviceId`] = extraData.deviceId;
    updates[`/device-requests/${requestId}/deviceAssignId`] = extraData.deviceAssignId;
  } else if (status === "declined") {
    updates[`/device-requests/${requestId}/declineReason`] =
      extraData.reason || "No reason provided.";
  }

  try {
    // 2. Perform Atomic Update
    await update(ref(db), updates);

    // 3. Trigger Unified System Audit Log
    const auditDetails =
      status === "approved"
        ? `Approved device request for Unit ${extraData.deviceId}`
        : `Declined device request: ${extraData.reason || "N/A"}`;

    await logActivity(`request_${status}`, requestId, auditDetails);

    return { success: true };
  } catch (error) {
    if (error instanceof appError) throw error;
    throw new appError(
      "Failed to update request status. Please try again later.",
      true,
      "request/update-failed"
    );
  }
};
