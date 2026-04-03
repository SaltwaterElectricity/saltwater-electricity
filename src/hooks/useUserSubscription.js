import { useState, useEffect, useRef, useCallback } from "react";
import { subscribeToAllUsers } from "../services/user.service";

export const useUserSubscription = (targetRole = null) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const isFirstLoad = useRef(true);

 // 1. Enhanced Error Handler with Logging
  const parseFirebaseError = useCallback((err) => {
    // 🚩 DEBUG LOG: Dito natin makikita ang totoong dahilan sa Inspect > Console
    console.error("DEBUG: Firebase Subscription Error Details:", {
      message: err?.message,
      code: err?.code,
      fullError: err
    });

    const msg = err?.message?.toLowerCase() || "";
    const code = err?.code || "";

    if (code.includes("permission-denied") || msg.includes("permission denied")) {
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
      } catch (err) {
        if (isMounted) {
          setError("Establishment failure: Protocol crash.");
          setLoading(false);
        }
      }
    };

    startSubscription();

    // 3. Cleanup Protocol (Production Safety)
    return () => {
      isMounted = false;
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [targetRole, parseFirebaseError]); // Added parseFirebaseError as dependency

  return { data, loading, error };
};