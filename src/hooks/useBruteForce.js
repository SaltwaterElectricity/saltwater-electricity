import { useState, useEffect, useCallback, useMemo } from "react";
import {
  subscribeToLoginAttempts,
  recordFailedLoginAttempt,
  resetLoginAttempts,
} from "../services/auth.service";

/**
 * Hook: useBruteForce
 * Manages login attempt tracking and account lockout state.
 */
export const useBruteForce = (trackingId) => {
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  // 1. Helper: MM:SS formatting
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const formattedTime = useMemo(() => formatTime(secondsRemaining), [secondsRemaining, formatTime]);

  // 2. Subscribe to attempt data in real-time
  useEffect(() => {
    if (!trackingId) {
      Promise.resolve().then(() => {
        setAttempts(0);
        setLockoutUntil(0);
        setSecondsRemaining(0);
      });
      return;
    }

    const unsubscribe = subscribeToLoginAttempts(trackingId, (data) => {
      const now = Date.now();

      if (data) {
        // AUTO-CLEANUP: If the record shows an expired lockout, wipe it
        if (data.lockoutUntil > 0 && data.lockoutUntil < now) {
          resetLoginAttempts(trackingId);
          return;
        }

        setAttempts(data.count || 0);
        const until = data.lockoutUntil || 0;
        setLockoutUntil(until);

        const diff = Math.max(0, Math.floor((until - now) / 1000));
        setSecondsRemaining(diff);
      } else {
        setAttempts(0);
        setLockoutUntil(0);
        setSecondsRemaining(0);
      }
    });

    return () => unsubscribe && unsubscribe();
  }, [trackingId]);

  // 3. Lockout Timer & Firebase Auto-Reset Logic
  useEffect(() => {
    let timer;

    if (lockoutUntil > Date.now()) {
      timer = setInterval(async () => {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((lockoutUntil - now) / 1000));
        setSecondsRemaining(remaining);

        if (remaining <= 0) {
          clearInterval(timer);
          resetLoginAttempts(trackingId);
        }
      }, 1000);
    } else {
      Promise.resolve().then(() => {
        setSecondsRemaining(0);
      });
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [lockoutUntil, trackingId]);

  // Derive isLocked from remaining time
  const isLocked = secondsRemaining > 0;

  // 4. Record Failed Attempt
  const recordAttempt = useCallback(async () => {
    await recordFailedLoginAttempt(trackingId);
  }, [trackingId]);

  return {
    attempts,
    isLocked,
    secondsRemaining,
    formattedTime,
    recordFailedAttempt: recordAttempt,
  };
};
