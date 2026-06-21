import {
  ref,
  push,
  serverTimestamp,
  update,
  get,
  onValue,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
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
  if (!currentUser) throw new appError("Please log in to continue.", true, "auth/unauthorized");

  const claims = await getUserClaims(currentUser);
  if (!claims?.admin && !claims?.superAdmin) {
    throw new appError(
      "Access Denied: You do not have permission to perform this administrative task.",
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
      "You must be logged in to submit a request. Please log in first.",
      true,
      "request/missing-auth"
    );
  }

  const userId = currentUser.uid;

  if (!deviceData?.requestType || !deviceData?.deviceName) {
    throw new appError(
      "Incomplete information. Please provide both the request type and device name.",
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

    // 🛡️ SYSTEM NOTIFICATION: Alert admins of new request
    const { createNotification } = await import("./notification.service");
    await createNotification(
      "admin",
      "New Device Request",
      `A new request for '${deviceData.deviceName}' has been submitted and is awaiting validation.`,
      "info"
    ).catch((err) => logger.warn("[Request Service]: Admin notification failed", err));

    // 🛡️ UNIFIED AUDIT LOG: Record request creation
    await logActivity(
      "DEVICE_REQUESTED",
      result.key,
      `New request submitted for device: ${deviceData.deviceName}`,
      { severity: "low" }
    ).catch((err) => logger.error("[Request Service]: Audit logging failed for new request", err));

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
      "The request service is currently offline. Please try again in a few moments.",
      true,
      "request/submission-failed"
    );
  }
};

/**
 * Cancels a pending device request (User-initiated).
 * ENFORCES: Ownership, Pending Status, and 24-hour window.
 *
 * @param {string} requestId - The ID of the request to cancel.
 * @param {Object} reasonData - { reason: string, feedback: string }
 */
export const cancelDeviceRequest = async (requestId, reasonData) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new appError("Please log in to continue.", true, "auth/unauthorized");

  try {
    // 1. Fetch Request to verify state
    const requestRef = ref(db, `device-requests/${requestId}`);
    const snapshot = await get(requestRef);

    if (!snapshot.exists()) {
      throw new appError("Request not found.", true, "request/not-found");
    }

    const requestData = snapshot.val();

    // 2. SECURITY GUARD: Ownership
    if (requestData.userId !== currentUser.uid) {
      throw new appError(
        "Unauthorized: You do not own this request.",
        true,
        "auth/insufficient-clearance"
      );
    }

    // 3. SECURITY GUARD: Status check (Only pending can be cancelled)
    if (requestData.status !== "pending") {
      throw new appError(
        `Cannot cancel: Request is already ${requestData.status}.`,
        true,
        "request/invalid-state"
      );
    }

    // 4. SECURITY GUARD: Time-gate (24 Hours)
    const CANCELLATION_WINDOW = 24 * 60 * 60 * 1000;
    const elapsed = Date.now() - requestData.createdAt;
    if (elapsed > CANCELLATION_WINDOW) {
      throw new appError(
        "Cancellation window has expired (24h limit).",
        true,
        "request/window-expired"
      );
    }

    // 5. ATOMIC UPDATE
    const now = serverTimestamp();
    const updates = {};
    updates[`/device-requests/${requestId}/status`] = "cancelled";
    updates[`/device-requests/${requestId}/cancelledAt`] = now;
    updates[`/device-requests/${requestId}/cancelReason`] = reasonData.reason;
    updates[`/device-requests/${requestId}/cancelFeedback`] = reasonData.feedback || "";

    await update(ref(db), updates);

    // 6. LOG TO AUDIT
    await logActivity(
      "REQUEST_CANCELLED",
      requestId,
      `User cancelled request. Reason: ${reasonData.reason}`,
      { severity: "low" }
    );

    return { success: true };
  } catch (error) {
    if (error instanceof appError) throw error;
    logger.error("[Request Service]: Cancellation failed.", error);
    throw new appError(
      "Failed to cancel request. Please try again later.",
      true,
      "request/cancel-failed"
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

    await logActivity(`request_${status}`, requestId, auditDetails, { severity: "medium" });

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

/**
 * Subscribes to device requests real-time.
 */
export const subscribeToDeviceRequests = (userId, callback, onError = null) => {
  const requestsRef = ref(db, "device-requests");
  const finalQuery = userId
    ? query(requestsRef, orderByChild("userId"), equalTo(userId))
    : requestsRef;

  return onValue(
    finalQuery,
    (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
      } else {
        const requestList = Object.entries(data).map(([id, val]) => ({
          id,
          ...val,
        }));
        // Sort descending
        requestList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        callback(requestList);
      }
    },
    onError
  );
};
