import { ref, update, get, serverTimestamp } from "firebase/database";
import { db } from "../firebaseConfig";


export const assignDevice = async (deviceId, userId, newDeviceName) => {
  // 1. SAFETY CHECK: Input Validation & Sanitization
  const cleanDeviceId = deviceId?.toString().trim();
  const cleanUserId = userId?.toString().trim();
  const cleanName = newDeviceName?.toString().trim().substring(0, 32);

  if (!cleanDeviceId || !cleanUserId) {
    return { success: false, error: "INVALID_PARAMETERS" };
  }

  try {
    // 2. AVAILABILITY CHECK: Anti-overwrite Guard
    // Chine-check natin ang main device node para sigurado na 'idle' pa ito
    const deviceStatusRef = ref(db, `device_information/${cleanDeviceId}/availability`);
    const statusSnapshot = await get(deviceStatusRef);

    if (statusSnapshot.exists() && statusSnapshot.val() !== 'available') {
      return { success: false, error: "DEVICE_ALREADY_OCCUPIED" };
    }

    // 3. ATOMIC TRANSACTION DATA
    const now = serverTimestamp();
    const updates = {};
    
    // Path A: Assignment Record (Audit Log for history)
    updates[`/device_assignments/${cleanDeviceId}`] = {
      userId: cleanUserId,
      assignedAt: now,
      status: "active"
    };

    // Path B: Update Device Information (Para sa Real-time UI Update)
    updates[`/device_information/${cleanDeviceId}/availability`] = "assigned";
    
    // Optional: I-update ang pangalan kung may binigay na bago
    if (cleanName) {
      updates[`/device_information/${cleanDeviceId}/device_name`] = cleanName;
    }

    await update(ref(db), updates);

    return { success: true };

  } catch (error) {
    // 4. SECURITY: Internal logging
    logInternalError(error); 
    return { success: false, error: "SERVICE_UNAVAILABLE" };
  }
};

const logInternalError = (err) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error("[Internal DB Trace]:", err);
  }
};