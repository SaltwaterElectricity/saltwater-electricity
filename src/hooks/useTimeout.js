import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/useAuth";

/**
 * PRODUCTION-READY TIMEOUT HOOK
 * Features: Event Throttling, Cross-Tab Sync, and Background Resilience.
 */
export const useTimeout = (timeoutLimit) => {
  const { setIsSessionExpired } = useAuth();
  const timeoutRef = useRef(null);
  const lastResetRef = useRef(null);

  // Initialize on mount
  useEffect(() => {
    lastResetRef.current = Date.now();
  }, []);

  // 1. TRIGGER EXPIRY STATE
  const triggerExpiry = useCallback(() => {
    localStorage.removeItem("last_activity");
    setIsSessionExpired(true);
  }, [setIsSessionExpired]);

  // 2. MEMOIZED RESET LOGIC WITH THROTTLING
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

      timeoutRef.current = setTimeout(triggerExpiry, timeoutLimit);
    },
    [timeoutLimit, triggerExpiry]
  );

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
          triggerExpiry();
        } else {
          // I-recompute ang timer batay sa natitirang oras
          resetTimer();
        }
      }
    };

    const events = ["mousemove", "keypress", "scroll", "mousedown", "touchstart"];

    // Attach listeners
    events.forEach((event) => window.addEventListener(event, resetTimer));
    window.addEventListener("visibilitychange", checkInactivityOnFocus);
    window.addEventListener("focus", checkInactivityOnFocus);

    // Initial trigger
    resetTimer();

    // CLEANUP: Prevent memory leaks
    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      window.removeEventListener("visibilitychange", checkInactivityOnFocus);
      window.removeEventListener("focus", checkInactivityOnFocus);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [resetTimer, timeoutLimit, triggerExpiry]);
};
