import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebaseConfig";
import { appError } from "../utils/appError";
import { logger } from "../utils/logger";

/**
 * Hook: useProfile
 * Manages real-time user profile retrieval.
 */
export const useProfile = (uid) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uid) return;

    let isMounted = true;
    const userRef = ref(db, `users/${uid}`);

    // Real-time listener for zero-downtime updates
    const unsubscribe = onValue(
      userRef,
      (snapshot) => {
        if (!isMounted) return;
        if (snapshot.exists()) {
          setProfile(snapshot.val());
          setError(null);
        } else {
          setError(new appError("Profile not found.", true, "db/not-found"));
        }
        setLoading(false);
      },
      (err) => {
        if (!isMounted) return;
        logger.error("Profile fetch error:", err);
        setError(
          new appError(
            "Permission denied or connection lost.",
            true,
            err.code || "db/permission-denied"
          )
        );
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [uid]);

  return { profile, loading, error };
};
