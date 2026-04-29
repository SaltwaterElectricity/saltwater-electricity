import { ref, update, get, serverTimestamp } from "firebase/database";
import { db } from "../firebaseConfig";
import { appError } from "../utils/appError";

export const assignDevice = async (deviceId, userId, newDeviceName) => {
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

    if (statusSnapshot.exists() && statusSnapshot.val() !== 'available') {
      throw new appError("This device is already assigned to another user.", true, "device/already-occupied");
    }

    // 3. ATOMIC TRANSACTION DATA
    const now = serverTimestamp();
    const updates = {};
    
    updates[`/device_assignments/${cleanDeviceId}`] = {
      userId: cleanUserId,
      assignedAt: now,
      status: "active"
    };

    updates[`/device_information/${cleanDeviceId}/availability`] = "assigned";
    
    if (cleanName) {
      updates[`/device_information/${cleanDeviceId}/device_name`] = cleanName;
    }

    await update(ref(db), updates);

    return { success: true };

  } catch (error) {
    if (error instanceof appError) throw error;
    
    logInternalError(error); 
    throw new appError("The monitoring service is temporarily unavailable. Please try again.", true, "device/service-unavailable");
  }
};

const logInternalError = (err) => {
  if (import.meta.env.MODE !== 'production') {
    console.error("[Internal DB Trace]:", err);
  }
};
