import { useState, useEffect, useRef, useCallback } from "react";
import { subscribeToAllUsers } from "../services/user.service";
import { appError } from "../utils/appError";
import { logger } from "../utils/logger";

/**
 * Hook: useUserSubscription
 * Subscribes to real-time user list updates.
 */
export const useUserSubscription = (targetRole = null) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const isFirstLoad = useRef(true);

  // Error Handler
  const parseFirebaseError = useCallback((err) => {
    logger.error("Firebase Subscription Error:", {
      message: err?.message,
      code: err?.code,
      fullError: err
    });

    const msg = err?.message?.toLowerCase() || "";
    const code = err?.code || "";

    if (code.includes("permission-denied") || msg.includes("permission denied")) {
      return new appError("Access Denied: Insufficient clearance for this data.", true, "db/permission-denied");
    }
    
    if (!navigator.onLine || msg.includes("network") || code.includes("network-error")) {
      return new appError("Connection Lost: Check your network connectivity.", true, "db/network-error");
    }

    if (code.includes("timeout")) {
      return new appError("Sync Timeout: The server is taking too long to respond.", true, "db/timeout");
    }

    return new appError(`System Error: Data stream interrupted. (Code: ${code || 'Unknown'})`, true, code || "db/unknown");
  }, []);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe = null;

    const startSubscription = () => {
      try {
        unsubscribe = subscribeToAllUsers(
          (userList) => {
            if (!isMounted) return;
            setData(userList);
            setLoading(false);
            isFirstLoad.current = false;
          },
          targetRole,
          (err) => {
            if (!isMounted) return;
            setError(parseFirebaseError(err));
            setLoading(false);
          }
        );
      } catch {
        if (isMounted) {
          setError(new appError("System failure: Could not establish connection.", false, "db/crash"));
          setLoading(false);
        }
      }
    };

    startSubscription();

    return () => {
      isMounted = false;
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [targetRole, parseFirebaseError]);

  return { data, loading, error };
};
