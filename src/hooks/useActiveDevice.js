import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { ref, query, orderByChild, equalTo, onValue, limitToFirst } from "firebase/database";

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
    let unsubscribe;
    const devicesRef = ref(db, "device_information");
    const assignmentsRef = ref(db, "device_assignments");

    if (isAdmin) {
      const q = query(devicesRef, limitToFirst(1));
      unsubscribe = onValue(q, (snapshot) => {
        if (snapshot.exists()) {
          setDeviceId(Object.keys(snapshot.val())[0]);
        }
        setLoading(false);
      });
    } else if (userId) {
      const q = query(devicesRef, orderByChild("assigned_user_id"), equalTo(userId));

      unsubscribe = onValue(q, (snapshot) => {
        if (snapshot.exists()) {
          setDeviceId(Object.keys(snapshot.val())[0]);
          setLoading(false);
        } else {
          // SECONDARY ATTEMPT: Manual scan of device_assignments
          onValue(
            assignmentsRef,
            (assignSnapshot) => {
              const assignments = assignSnapshot.val();
              let foundId = null;
              if (assignments) {
                const myDevice = Object.entries(assignments).find(
                  ([_, data]) => data.userId === userId
                );
                if (myDevice) foundId = myDevice[0];
              }
              setDeviceId(foundId);
              setLoading(false);
            },
            { onlyOnce: true }
          );
        }
      });
    }

    return () => unsubscribe && unsubscribe();
  }, [userId, isAdmin]);

  return { deviceId, loading };
};
