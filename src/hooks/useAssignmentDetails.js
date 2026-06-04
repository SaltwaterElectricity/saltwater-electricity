import { useState, useEffect } from "react";
import { subscribeToAssignmentDetails } from "../services/device.service";
import { logger } from "../utils/logger";

/**
 * useAssignmentDetails Hook (Production-Ready)
 */
export const useAssignmentDetails = (deviceId) => {
  const [details, setDetails] = useState({
    fullName: "Loading...",
    address: "Loading...",
    assignedAt: null,
    loading: !!deviceId,
  });

  useEffect(() => {
    if (!deviceId) return;

    const unsubscribe = subscribeToAssignmentDetails(
      deviceId,
      (data) => {
        setDetails({
          ...data,
          loading: false,
        });
      },
      (error) => {
        logger.error("[Assignment Hook]: Error:", error);
        setDetails((prev) => ({ ...prev, fullName: "Information unavailable", loading: false }));
      }
    );

    return () => unsubscribe && unsubscribe();
  }, [deviceId]);

  return details;
};
