import { useState, useEffect } from "react";
import { subscribeToUserDevice } from "../services/device.service";

/**
 * Hook: useActiveDevice
 * Finds the first device assigned to a user, or the first available device for admins.
 */
export const useActiveDevice = (userId, isAdmin = false) => {
  const [deviceId, setDeviceId] = useState(null);
  // Initialize loading based on whether we have parameters to act on
  const [loading, setLoading] = useState(!!(isAdmin || userId));

  useEffect(() => {
    // If no criteria provided, we can't load anything
    if (!isAdmin && !userId) {
      Promise.resolve().then(() => {
        setDeviceId(null);
        setLoading(false);
      });
      return;
    }

    Promise.resolve().then(() => setLoading(true));

    const unsubscribe = subscribeToUserDevice(
      userId,
      isAdmin,
      (id) => {
        setDeviceId(id);
        setLoading(false);
      },
      (err) => {
        console.error("[useActiveDevice] Error:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe && unsubscribe();
  }, [userId, isAdmin]);

  return { deviceId, loading };
};
