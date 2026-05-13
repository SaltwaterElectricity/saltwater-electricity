import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebaseConfig";
<<<<<<< HEAD
import { appError } from "../utils/appError";
import { logger } from "../utils/logger";

/**
 * Hook: useProfile
 * Manages real-time user profile retrieval.
 */
=======

>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
export const useProfile = (uid) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
<<<<<<< HEAD
    if (!uid) return;

    let isMounted = true;
    const userRef = ref(db, `users/${uid}`);
    
    // Real-time listener for zero-downtime updates
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (!isMounted) return;
      if (snapshot.exists()) {
        setProfile(snapshot.val());
        setError(null);
      } else {
        setError(new appError("Profile not found.", true, "db/not-found"));
      }
      setLoading(false);
    }, (err) => {
      if (!isMounted) return;
      logger.error("Profile fetch error:", err);
      setError(new appError("Permission denied or connection lost.", true, err.code || "db/permission-denied"));
      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [uid]);

  return { profile, loading, error };
};
=======
    if (!uid) {
      setLoading(false);
      return;
    }

    const userRef = ref(db, `users/${uid}`);
    
    // Real-time listener: 0 downtime updates
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.val());
      } else {
        setError("Profile not found.");
      }
      setLoading(false);
    }, (err) => {
      console.error(err);
      setError("Permission denied or connection lost.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  return { profile, loading, error };
};
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
