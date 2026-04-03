import { useEffect, useRef, useCallback } from "react";
import { logoutUser } from "../services/auth.service";

/**
 * PRODUCTION-READY TIMEOUT HOOK
 * Features: Event Throttling, Cross-Tab Sync, and Background Resilience.
 */
export const useTimeout = (timeoutLimit) => {
  const timeoutRef = useRef(null);
  const lastResetRef = useRef(Date.now());

  // 1. CENTRALIZED LOGOUT LOGIC
  const handleLogout = useCallback(async () => {
    try {
      // Linisin ang disk data bago mag-logout
      localStorage.removeItem("last_activity");
      await logoutUser();
    } catch (error) {
      // Fallback redirect kung mawalan ng internet
      window.location.href = "/login";
    }
  }, []);

  // 2. MEMOIZED RESET LOGIC WITH THROTTLING
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

  // 3. VISIBILITY & EVENT LISTENER MANAGEMENT
  useEffect(() => {
    // Safety exit kung walang limit
    if (!timeoutLimit) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return; 
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
    
    // Attach listeners
    events.forEach(event => window.addEventListener(event, resetTimer));
    window.addEventListener("visibilitychange", checkInactivityOnFocus);
    window.addEventListener("focus", checkInactivityOnFocus);

    // Initial trigger
    resetTimer();

    // CLEANUP: Prevent memory leaks
    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      window.removeEventListener("visibilitychange", checkInactivityOnFocus);
      window.removeEventListener("focus", checkInactivityOnFocus);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [resetTimer, timeoutLimit, handleLogout]);
};