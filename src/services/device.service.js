import { 
  ref, 
  update, 
  get, 
  serverTimestamp, 
  onValue, 
  query, 
  orderByChild, 
  equalTo, 
  limitToFirst 
} from "firebase/database";
import { auth, db } from "../firebaseConfig";
import { appError } from "../utils/appError";
import { logger } from "../utils/logger";
import { getUserClaims } from "./auth.service";
import { logActivity } from "./audit.service";

/**
 * INTERNAL GUARD: Verifies Admin clearance via Token Claims
 */
const verifyAdminClearance = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new appError("Authentication required.", true, "auth/unauthorized");

  const claims = await getUserClaims(currentUser);
  if (!claims?.admin && !claims?.superAdmin) {
    throw new appError(
      "Access Denied: Administrative clearance required.",
      true,
      "auth/insufficient-clearance"
    );
  }
  return true;
};

export const assignDevice = async (deviceId, userId, newDeviceName) => {
  // 🛡️ SECONDARY ROLE CHECK: Authoritative Token Verification
  await verifyAdminClearance();

  // 1. SAFETY CHECK: Input Validation & Sanitization
  const cleanDeviceId = deviceId?.toString().trim();
  const cleanUserId = userId?.toString().trim();
  const cleanName = newDeviceName?.toString().trim().substring(0, 32);

  if (!cleanDeviceId || !cleanUserId) {
    throw new appError("Device ID and User ID are required.", true, "device/invalid-parameters");
  }

  try {
    // 2. AVAILABILITY CHECK: Anti-overwrite Guard
    const deviceStatusRef = ref(db, `device_information/${cleanDeviceId}/availability`);
    const statusSnapshot = await get(deviceStatusRef);

    if (statusSnapshot.exists() && statusSnapshot.val() !== "available") {
      throw new appError(
        "This device is already assigned to another user.",
        true,
        "device/already-occupied"
      );
    }

    // 3. ATOMIC TRANSACTION DATA
    const now = serverTimestamp();
    const updates = {};

    updates[`/device_assignments/${cleanDeviceId}`] = {
      userId: cleanUserId,
      assignedAt: now,
      status: "active",
    };

    updates[`/device_information/${cleanDeviceId}/availability`] = "assigned";
    updates[`/device_information/${cleanDeviceId}/assigned_user_id`] = cleanUserId;

    // Fetch user name to store in device_information for quick access
    const userSnap = await get(ref(db, `users/${cleanUserId}`));
    if (userSnap.exists()) {
      const userData = userSnap.val();
      updates[`/device_information/${cleanDeviceId}/assigned_user_name`] =
        `${userData.firstName || ""} ${userData.lastName || ""}`.trim();
    }

    if (cleanName) {
      updates[`/device_information/${cleanDeviceId}/device_name`] = cleanName;
    }

    await update(ref(db), updates);

    // 4. AUDIT LOGGING
    await logActivity(
      "DEVICE_ASSIGNED",
      cleanDeviceId,
      `Device assigned to User: ${cleanUserId}${cleanName ? ` with name: ${cleanName}` : ""}`
    );

    return { success: true };
  } catch (error) {
    if (error instanceof appError) throw error;

    logInternalError(error);
    throw new appError(
      "The monitoring service is temporarily unavailable. Please try again.",
      true,
      "device/service-unavailable"
    );
  }
};

/**
 * DEPROVISION DEVICE
 * Removes user binding and resets device state to 'available'.
 *
 * @param {string} deviceId - ID of the device to release
 */
export const deprovisionDevice = async (deviceId) => {
  if (!deviceId) throw new appError("Device identifier required.", true, "device/invalid-id");

  // 🛡️ SECONDARY ROLE CHECK: Authoritative Token Verification
  await verifyAdminClearance();

  try {
    const updates = {};

    // 1. Remove from assignments
    updates[`/device_assignments/${deviceId}`] = null;

    // 2. Reset device info
    updates[`/device_information/${deviceId}/availability`] = "available";
    updates[`/device_information/${deviceId}/assigned_user_id`] = null;
    updates[`/device_information/${deviceId}/assigned_user_name`] = null;

    await update(ref(db), updates);

    // 3. AUDIT LOGGING
    await logActivity(
      "DEVICE_DEPROVISIONED",
      deviceId,
      `Device deprovisioned and returned to available inventory.`
    );

    return { success: true };
  } catch (error) {
    logInternalError(error);
    throw new appError(
      "Action failed. Please check your connection.",
      true,
      "device/override-failed"
    );
  }
};

/**
 * Subscribes to device assignments real-time.
 */
export const subscribeToAssignments = (callback, onError = null) => {
  const assignmentsRef = ref(db, "device_assignments");
  return onValue(assignmentsRef, (snapshot) => {
    callback(snapshot.val() || {});
  }, onError);
};

/**
 * Subscribes to device information.
 */
export const subscribeToDevices = (onlyAvailable, callback, onError = null) => {
  const devicesRef = ref(db, "device_information");
  const finalQuery = onlyAvailable
    ? query(devicesRef, orderByChild("availability"), equalTo("available"))
    : devicesRef;

  return onValue(finalQuery, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
    } else {
      const deviceList = Object.entries(data).map(([id, val]) => ({
        device_id: id,
        ...val,
      }));
      callback(deviceList);
    }
  }, onError);
};

/**
 * Subscribes to the first device assigned to a user, or the first available for admins.
 */
export const subscribeToUserDevice = (userId, isAdmin, callback, onError = null) => {
  const devicesRef = ref(db, "device_information");
  const assignmentsRef = ref(db, "device_assignments");

  if (isAdmin) {
    const q = query(devicesRef, limitToFirst(1));
    return onValue(q, (snapshot) => {
      if (snapshot.exists()) {
        callback(Object.keys(snapshot.val())[0]);
      } else {
        callback(null);
      }
    }, onError);
  } else if (userId) {
    const q = query(devicesRef, orderByChild("assigned_user_id"), equalTo(userId));
    return onValue(q, (snapshot) => {
      if (snapshot.exists()) {
        callback(Object.keys(snapshot.val())[0]);
      } else {
        // SECONDARY ATTEMPT: Manual scan of device_assignments
        onValue(assignmentsRef, (assignSnapshot) => {
          const assignments = assignSnapshot.val();
          let foundId = null;
          if (assignments) {
            const myDevice = Object.entries(assignments).find(
              ([_, data]) => data.userId === userId
            );
            if (myDevice) foundId = myDevice[0];
          }
          callback(foundId);
        }, { onlyOnce: true });
      }
    }, onError);
  }
  return () => {};
};

/**
 * Subscribes to assignment details with hydration from user data.
 */
export const subscribeToAssignmentDetails = (deviceId, callback, onError = null) => {
  if (!deviceId) return () => {};
  const assignmentRef = ref(db, `device_assignments/${deviceId}`);

  return onValue(assignmentRef, (snapshot) => {
    const assignmentData = snapshot.val();
    if (assignmentData?.userId) {
      const userRef = ref(db, `users/${assignmentData.userId}`);
      onValue(userRef, (userSnapshot) => {
        const userData = userSnapshot.val();
        if (userData) {
          callback({
            fullName: `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || "Unnamed User",
            address: userData.address || "No Address Provided",
            assignedAt: assignmentData.assignedAt,
          });
        } else {
          callback({
            fullName: "User Not Found",
            address: "N/A",
            assignedAt: null,
          });
        }
      }, { onlyOnce: true });
    } else {
      callback({
        fullName: "Not Assigned",
        address: "N/A",
        assignedAt: null,
      });
    }
  }, onError);
};

const logInternalError = (err) => {
  logger.error("[Internal DB Trace]:", err);
};
