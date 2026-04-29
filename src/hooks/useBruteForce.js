import { useState, useEffect, useCallback } from "react";
import { ref, onValue, update, get } from "firebase/database";
import { db } from "../firebaseConfig";

/**
 * Hook: useBruteForce
 * Manages login attempt tracking and account lockout state.
 */
export const useBruteForce = (userId) => {
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  // 1. Subscribe to attempt data in real-time
  useEffect(() => {
    if (!userId) return;

    const attemptsRef = ref(db, `login_attempts/${userId}`);
    const unsubscribe = onValue(attemptsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAttempts(data.count || 0);
        setLockoutUntil(data.lockoutUntil || 0);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  // 2. Lockout Timer Logic
  useEffect(() => {
    if (lockoutUntil > Date.now()) {
      setIsLocked(true);
      const timer = setInterval(() => {
        const remaining = Math.max(0, Math.floor((lockoutUntil - Date.now()) / 1000));
        setSecondsRemaining(remaining);
        if (remaining === 0) {
          setIsLocked(false);
          clearInterval(timer);
        }
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setIsLocked(false);
    }
  }, [lockoutUntil]);

  // 3. Record Failed Attempt
  const recordFailedAttempt = useCallback(async () => {
    if (!userId) return;

    const attemptsRef = ref(db, `login_attempts/${userId}`);
    const snap = await get(attemptsRef);
    const data = snap.val() || { count: 0 };
    const newCount = data.count + 1;
    const newLockoutUntil = newCount >= 5 ? Date.now() + 300000 : 0;
    
    await update(attemptsRef, { count: newCount, lockoutUntil: newLockoutUntil });
  }, [userId]);

  return { attempts, isLocked, secondsRemaining, recordFailedAttempt };
};
