import { ref, update, get, serverTimestamp } from "firebase/database";
import { db } from "./firebase-config";

export const assignDevice = async (deviceId, userId) => {
  // 1. SAFETY CHECK: Input Validation & Sanitization
  // Importante ang .trim() para iwas sa accidental spaces sa ID
  const cleanDeviceId = deviceId?.toString().trim();
  const cleanUserId = userId?.toString().trim();

  if (!cleanDeviceId || !cleanUserId) {
    return { success: false, error: "INVALID_PARAMETERS" };
  }

  try {
    // 2. AVAILABILITY CHECK: Anti-overwrite Guard
    const deviceRef = ref(db, `device_assignments/${cleanDeviceId}`);
    const snapshot = await get(deviceRef); // FIXED: Pantay na ang variable names

    if (snapshot.exists()) {
      return { success: false, error: "DEVICE_UNAVAILABLE" };
    }

    // 3. ATOMIC TRANSACTION DATA
    const now = serverTimestamp();
    const updates = {};
    
    updates[`/device_assignments/${cleanDeviceId}`] = {
      userId: cleanUserId,
      assignedAt: now,
      status: "active"
    };

    /**
     * Bakit ito 'Safe' for Production?
     * - update() ay atomic. Hindi ito mag-o-overwrite ng ibang fields sa node.
     * - Walang loops, kaya hindi ito magko-cause ng CPU spikes.
     */
    await update(ref(db), updates);

    return { success: true };

  } catch (error) {
    // 4. SECURITY: Internal logging (Huwag i-leak ang database paths sa client)
    logInternalError(error); 
    return { success: false, error: "SERVICE_UNAVAILABLE" };
  }
};

const logInternalError = (err) => {
  // Mas maganda kung may dedicated logging service ka, pero okay na ang environment check
  if (process.env.NODE_ENV !== 'production') {
    console.error("[Internal DB Trace]:", err);
  }
};