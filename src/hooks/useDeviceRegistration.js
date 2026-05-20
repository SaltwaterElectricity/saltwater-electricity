import { useState, useCallback } from "react";
import { db } from "../firebaseConfig";
import { ref, get, update, query, orderByChild, equalTo, serverTimestamp } from "firebase/database";

export const useDeviceRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const register = useCallback(async (macAddress, userDeviceName, userInfo) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Data Normalization
      const email = userInfo?.email;
      if (!email) throw new Error("User email is required for registration.");
      const normalizedEmail = email.toLowerCase().trim();

      // 2. Fetch Device Data & Safety Check
      const deviceRef = ref(db, `device_information/${macAddress}`);
      const deviceSnap = await get(deviceRef);

      if (!deviceSnap.exists()) {
        throw new Error("Hardware ID not found in registry.");
      }

      const deviceData = deviceSnap.val();

      // Check if the device is already owned
      if (deviceData.availability !== "available") {
        throw new Error("This device is already registered to another account.");
      }

      // 3. Authority Check: Find existing user UID by email
      const usersRef = ref(db, "users");
      const emailQuery = query(usersRef, orderByChild("email"), equalTo(normalizedEmail));
      const userSnapshot = await get(emailQuery);

      if (!userSnapshot.exists()) {
        throw new Error(
          "No registered user found with this email. Please create an account first."
        );
      }

      const entries = Object.entries(userSnapshot.val());
      const uid = entries[0][0]; // Authority: Get the actual Firebase UID

      const finalDeviceName = userDeviceName?.trim() || deviceData.device_name || "Unnamed Node";

      // 4. ATOMIC UPDATE (Multi-Path)
      const updates = {};

      // Metadata in device_information
      updates[`/device_information/${macAddress}/availability`] = "assigned";
      updates[`/device_information/${macAddress}/device_name`] = finalDeviceName;

      // Normalized Binding in device_assignments
      updates[`/device_assignments/${macAddress}`] = {
        userId: uid,
        assignedAt: serverTimestamp(),
        status: "active",
      };

      await update(ref(db), updates);

      return { success: true, ownerId: uid };
    } catch (err) {
      console.error("Registration Error:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { register, loading, error };
};
