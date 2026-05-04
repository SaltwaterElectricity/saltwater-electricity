import { useState, useEffect, useCallback, useMemo } from "react";
import { ref, onValue, update, get, set } from "firebase/database";
import { db } from "../firebaseConfig";
import { logger } from "../utils/logger";

/**
 * Hook: useBruteForce
 * Manages login attempt tracking and account lockout state.
 * Standardized on sanitized email as the tracking key to allow pre-auth protection.
 */
export const useBruteForce = (trackingId) => {
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  // 1. Helper: MM:SS formatting
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const formattedTime = useMemo(() => formatTime(secondsRemaining), [secondsRemaining, formatTime]);

  // 2. Subscribe to attempt data in real-time
  useEffect(() => {
    if (!trackingId) {
      // Use microtasks to avoid sync render cycle warnings
      Promise.resolve().then(() => {
        setAttempts(prev => prev === 0 ? prev : 0);
        setLockoutUntil(prev => prev === 0 ? prev : 0);
        setSecondsRemaining(prev => prev === 0 ? prev : 0);
      });
      return;
    }

    const attemptsRef = ref(db, `login-attempts/${trackingId}`);
    const unsubscribe = onValue(attemptsRef, (snapshot) => {
      const data = snapshot.val();
      const now = Date.now();

      if (data) {
        // AUTO-CLEANUP: If the record shows an expired lockout, wipe it
        // This ensures the next attempt starts from 0 (5 fresh attempts)
        if (data.lockoutUntil > 0 && data.lockoutUntil < now) {
          set(attemptsRef, null);
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

    return () => unsubscribe();
  }, [trackingId]);

  // 3. Lockout Timer & Firebase Auto-Reset Logic
  useEffect(() => {
    let timer;
    
    if (lockoutUntil > Date.now()) {
      timer = setInterval(async () => {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((lockoutUntil - now) / 1000));
        setSecondsRemaining(remaining);

        // Call set exactly once when lockout expires
        if (remaining <= 0) {
          clearInterval(timer);
          if (trackingId) {
            const attemptsRef = ref(db, `login-attempts/${trackingId}`);
            try {
              // RESET: Deleting the node allows the next 5 attempts to be fresh
              await set(attemptsRef, null);
            } catch (err) {
              logger.warn("[useBruteForce] Auto-reset failed:", err.message);
            }
          }
        }
      }, 1000);
    } else {
      Promise.resolve().then(() => {
        setSecondsRemaining(prev => prev === 0 ? prev : 0);
      });
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [lockoutUntil, trackingId]);

  // Derive isLocked from remaining time
  const isLocked = secondsRemaining > 0;

  // 4. Record Failed Attempt
  const recordFailedAttempt = useCallback(async () => {
    if (!trackingId) return;

    const attemptsRef = ref(db, `login-attempts/${trackingId}`);
    
    try {
      const snap = await get(attemptsRef);
      const data = snap.val() || { count: 0, lockoutUntil: 0 };
      const now = Date.now();

      // LOGIC RESET: If previous lockout is already in the past, ignore old count
      const isExpired = data.lockoutUntil > 0 && data.lockoutUntil < now;
      const baseCount = isExpired ? 0 : data.count;
      
      const newCount = baseCount + 1;
      
      // Lockout logic: 5 attempts = 5 minute lockout (300,000ms)
      const isLockingOut = newCount >= 5;
      const newLockoutUntil = isLockingOut ? now + 300000 : 0;
      
      await update(attemptsRef, { 
        count: newCount, 
        lockoutUntil: newLockoutUntil,
        lastAttemptAt: now
      });
    } catch (error) {
      if (error.code === "PERMISSION_DENIED") {
        logger.warn("[useBruteForce] Protection inactive: Check Firebase Security Rules for /login-attempts");
      } else {
        logger.error("[useBruteForce] Failed to record attempt:", error);
      }
    }
  }, [trackingId]);

  return { attempts, isLocked, secondsRemaining, formattedTime, recordFailedAttempt };
};
