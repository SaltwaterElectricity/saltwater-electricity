import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { ref, onValue } from "firebase/database";
import { logger } from "../utils/logger";

/**
 * useAssignmentDetails Hook (Production-Ready)
 * Naka-optimize gamit ang Functional Updates at Mounted Flags.
 */
export const useAssignmentDetails = (deviceId) => {
  const [details, setDetails] = useState({
    fullName: "Loading...",
    address: "Loading...",
    assignedAt: null,
    loading: !!deviceId, // Initialize loading based on presence of deviceId
  });

  useEffect(() => {
    if (!deviceId) return;

    let isMounted = true;
    const assignmentRef = ref(db, `device_assignments/${deviceId}`);

    const unsubscribeAssignment = onValue(
      assignmentRef,
      (snapshot) => {
        const assignmentData = snapshot.val();

        if (assignmentData?.userId) {
          const userRef = ref(db, `users/${assignmentData.userId}`);

          onValue(
            userRef,
            (userSnapshot) => {
              if (!isMounted) return;

              const userData = userSnapshot.val();
              if (userData) {
                setDetails({
                  fullName:
                    `${userData.firstName || ""} ${userData.lastName || ""}`.trim() ||
                    "Unnamed User",
                  address: userData.address || "No Address Provided",
                  assignedAt: assignmentData.assignedAt,
                  loading: false,
                });
              } else {
                setDetails({
                  fullName: "User Not Found",
                  address: "N/A",
                  assignedAt: null,
                  loading: false,
                });
              }
            },
            { onlyOnce: true }
          );
        } else {
          if (isMounted) {
            setDetails({
              fullName: "Not Assigned",
              address: "N/A",
              assignedAt: null,
              loading: false,
            });
          }
        }
      },
      (error) => {
        logger.error("[Assignment Hook]: Firebase Fetch Error:", error);
        if (isMounted) {
          setDetails((prev) => ({ ...prev, fullName: "Information unavailable", loading: false }));
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribeAssignment();
    };
  }, [deviceId]);

  return details;
};
