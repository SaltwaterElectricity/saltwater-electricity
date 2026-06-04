import { useState, useEffect } from "react";
import { subscribeToUserProfile } from "../services/user.service";
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

    const unsubscribe = subscribeToUserProfile(
      uid,
      (data) => {
        setProfile(data);
        setError(null);
        setLoading(false);
      },
      (err) => {
        logger.error("Profile fetch error:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe && unsubscribe();
  }, [uid]);

  return { profile, loading, error };
};
