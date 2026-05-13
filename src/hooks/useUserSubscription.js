import { useState, useEffect, useRef, useCallback } from "react";
import { subscribeToAllUsers } from "../services/user.service";
<<<<<<< HEAD
import { appError } from "../utils/appError";
import { logger } from "../utils/logger";

/**
 * Hook: useUserSubscription
 * Subscribes to real-time user list updates.
 */
=======

>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
export const useUserSubscription = (targetRole = null) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
<<<<<<< HEAD

  const isFirstLoad = useRef(true);

  // Error Handler
  const parseFirebaseError = useCallback((err) => {
    logger.error("Firebase Subscription Error:", {
      message: err?.message,
      code: err?.code,
      fullError: err,
=======
  
  const isFirstLoad = useRef(true);

 // 1. Enhanced Error Handler with Logging
  const parseFirebaseError = useCallback((err) => {
    // 🚩 DEBUG LOG: Dito natin makikita ang totoong dahilan sa Inspect > Console
    console.error("DEBUG: Firebase Subscription Error Details:", {
      message: err?.message,
      code: err?.code,
      fullError: err
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
    });

    const msg = err?.message?.toLowerCase() || "";
    const code = err?.code || "";

    if (code.includes("permission-denied") || msg.includes("permission denied")) {
<<<<<<< HEAD
      return new appError(
        "Access Denied: Insufficient clearance for this data.",
        true,
        "db/permission-denied"
      );
    }

    if (!navigator.onLine || msg.includes("network") || code.includes("network-error")) {
      return new appError(
        "Connection Lost: Check your network connectivity.",
        true,
        "db/network-error"
      );
    }

    if (code.includes("timeout")) {
      return new appError(
        "Sync Timeout: The server is taking too long to respond.",
        true,
        "db/timeout"
      );
    }

    return new appError(
      "System Error: The data stream was interrupted unexpectedly.",
      true,
      code || "db/unknown"
    );
  }, []);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe = null;

=======
      return "Access Denied: Insufficient clearance for this directory.";
    }
    
    // 🌐 Internet Check
    if (!navigator.onLine || msg.includes("network") || code.includes("network-error")) {
      return "Connection Lost: Check your link to the SmartAqua facility.";
    }

    // 🕒 Timeout Check (Common sa Firebase Realtime DB)
    if (code.includes("timeout")) {
      return "Sync Timeout: SmartAqua server is taking too long to respond.";
    }

    // Default Fallback - dinagdagan natin ng code para alam natin kung ano ang culprit
    return `System Anomaly: Data stream interrupted. (Error Code: ${code || 'Unknown'})`;
  }, []);

  useEffect(() => {
    // UI Safety: Only trigger full loading on initial boot
    if (isFirstLoad.current) setLoading(true);
    setError(null);

    let isMounted = true;
    let unsubscribe = null;

    // 2. Optimized Listener Logic
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
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
<<<<<<< HEAD
      } catch {
        if (isMounted) {
          setError(
            new appError("System failure: Could not establish connection.", false, "db/crash")
          );
=======
      } catch (err) {
        if (isMounted) {
          setError("Establishment failure: Protocol crash.");
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
          setLoading(false);
        }
      }
    };

    startSubscription();

<<<<<<< HEAD
=======
    // 3. Cleanup Protocol (Production Safety)
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
    return () => {
      isMounted = false;
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
<<<<<<< HEAD
  }, [targetRole, parseFirebaseError]);

  return { data, loading, error };
};
=======
  }, [targetRole, parseFirebaseError]); // Added parseFirebaseError as dependency

  return { data, loading, error };
};
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
