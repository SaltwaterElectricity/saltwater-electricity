import { useState, useEffect, useRef, useCallback } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebaseConfig";
import { AUTH_ERROR_MESSAGES } from "../services/auth.service";
import { appError } from "../utils/appError";

export const useFullUserData = (uid) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(!!uid);
  const [error, setError] = useState(null);
  const [prevUid, setPrevUid] = useState(uid);

  // Sync loading state when uid changes
  if (uid !== prevUid) {
    setPrevUid(uid);
    setLoading(!!uid);
    setError(null);
  }

  // ✅ 1. Hooks must be at the TOP LEVEL
  const dataState = useRef({ profile: {}, roleData: {}, account: {} });

  const updateCombinedState = useCallback(() => {
    setUserData({
      uid,
      ...dataState.current.profile,
      role: dataState.current.roleData?.role || "user",
      status: dataState.current.account?.status || "active",
      requiresPasswordChange: dataState.current.account?.requiresPasswordChange || false,
      isPrivate: dataState.current.roleData?.isPrivate || false,
    });
    setLoading(false);
  }, [uid]);

  useEffect(() => {
    if (!uid) {
      return;
    }

    // ✅ Reset the ref when UID changes
    dataState.current = { profile: {}, roleData: {}, account: {} };

    const refs = {
      user: ref(db, `users/${uid}`),
      role: ref(db, `roles/${uid}`),
      account: ref(db, `accounts/${uid}`),
    };

    const handleError = (err) => {
      const code = err?.code || err?.message || "default";
      const message = AUTH_ERROR_MESSAGES[code] || AUTH_ERROR_MESSAGES.default;
      setError(new appError(message, true, code));
      setLoading(false);
    };

    // ✅ 3. Correctly updating .current in listeners
    const unsubUser = onValue(refs.user, (snap) => {
      dataState.current.profile = snap.val() || {};
      updateCombinedState();
    }, handleError);

    const unsubRole = onValue(refs.role, (snap) => {
      dataState.current.roleData = snap.val() || {};
      updateCombinedState();
    }, handleError);

    const unsubAccount = onValue(refs.account, (snap) => {
      dataState.current.account = snap.val() || {};
      updateCombinedState();
    }, handleError);

    return () => {
      unsubUser();
      unsubRole();
      unsubAccount();
    };
  }, [uid, updateCombinedState]); // ✅ Added updateCombinedState as dependency

  return { userData, loading, error };
};
