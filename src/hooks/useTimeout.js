import { useEffect, useRef, useCallback } from "react";
import { logoutUser } from "../services/auth.service";

/**
 * PRODUCTION-READY TIMEOUT HOOK
 * Features: Event Throttling, Cross-Tab Sync, and Background Resilience.
 */
export const useTimeout = (timeoutLimit) => {
  const timeoutRef = useRef(null);
<<<<<<< HEAD
  const lastResetRef = useRef(null);

  // Initialize on mount
  useEffect(() => {
    lastResetRef.current = Date.now();
  }, []);
=======
  const lastResetRef = useRef(Date.now());
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a

  // 1. CENTRALIZED LOGOUT LOGIC
  const handleLogout = useCallback(async () => {
    try {
<<<<<<< HEAD
      localStorage.removeItem("last_activity");
      await logoutUser();
    } catch {
=======
      // Linisin ang disk data bago mag-logout
      localStorage.removeItem("last_activity");
      await logoutUser();
    } catch (error) {
      // Fallback redirect kung mawalan ng internet
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
      window.location.href = "/login";
    }
  }, []);

  // 2. MEMOIZED RESET LOGIC WITH THROTTLING
<<<<<<< HEAD
  const resetTimer = useCallback(
    (e) => {
      if (!timeoutLimit) return;

      const now = Date.now();
      if (e?.type === "mousemove") {
        if (lastResetRef.current && now - lastResetRef.current < 2000) return;
      }

      lastResetRef.current = now;
      localStorage.setItem("last_activity", now.toString());

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(handleLogout, timeoutLimit);
    },
    [timeoutLimit, handleLogout]
  );
=======
  const resetTimer = useCallback((e) => {
    if (!timeoutLimit) return;

    const now = Date.now();

    // THROTTLING: 2-second buffer para sa mousemove para iwas UI lag/flicker
    if (e?.type === "mousemove") {
      if (now - lastResetRef.current < 2000) return;
    }
    
    lastResetRef.current = now;
    // I-save sa localStorage para sa visibility check at cross-tab sync
    localStorage.setItem("last_activity", now.toString());

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(handleLogout, timeoutLimit);
  }, [timeoutLimit, handleLogout]);
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a

  // 3. VISIBILITY & EVENT LISTENER MANAGEMENT
  useEffect(() => {
    // Safety exit kung walang limit
    if (!timeoutLimit) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
<<<<<<< HEAD
      return;
=======
      return; 
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
    }

    // Check inactivity kapag bumalik ang user sa tab (browser throttling fix)
    const checkInactivityOnFocus = () => {
      if (document.visibilityState === "visible") {
        const lastActivity = parseInt(localStorage.getItem("last_activity") || Date.now());
        const timeElapsed = Date.now() - lastActivity;

        if (timeElapsed >= timeoutLimit) {
          handleLogout();
        } else {
          // I-recompute ang timer batay sa natitirang oras
          resetTimer();
        }
      }
    };

    const events = ["mousemove", "keypress", "scroll", "mousedown", "touchstart"];
<<<<<<< HEAD

    // Attach listeners
    events.forEach((event) => window.addEventListener(event, resetTimer));
=======
    
    // Attach listeners
    events.forEach(event => window.addEventListener(event, resetTimer));
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
    window.addEventListener("visibilitychange", checkInactivityOnFocus);
    window.addEventListener("focus", checkInactivityOnFocus);

    // Initial trigger
    resetTimer();

    // CLEANUP: Prevent memory leaks
    return () => {
<<<<<<< HEAD
      events.forEach((event) => window.removeEventListener(event, resetTimer));
=======
      events.forEach(event => window.removeEventListener(event, resetTimer));
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
      window.removeEventListener("visibilitychange", checkInactivityOnFocus);
      window.removeEventListener("focus", checkInactivityOnFocus);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [resetTimer, timeoutLimit, handleLogout]);
<<<<<<< HEAD
};
=======
};
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
