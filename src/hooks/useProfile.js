import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebaseConfig";

export const useProfile = (uid) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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