<<<<<<< HEAD
import { useEffect, useRef, useCallback, useReducer } from "react";
import { ROLES } from "../constants/roles";
import { ref, onValue } from "firebase/database";
import { db } from "../firebaseConfig";
import { AUTH_ERROR_MESSAGES } from "../services/auth.service";
import { appError } from "../utils/appError";

const initialState = (uid) => ({
  userData: null,
  loading: !!uid,
  error: null,
  uid,
});

const reducer = (state, action) => {
  switch (action.type) {
    case "RESET":
      return initialState(action.uid);
    case "SET_DATA":
      return { ...state, userData: action.payload, loading: false, error: null };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

export const useFullUserData = (uid) => {
  const [state, dispatch] = useReducer(reducer, uid, initialState);
=======
import { useState, useEffect, useRef, useCallback } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebaseConfig";
import { AUTH_ERROR_MESSAGES } from "../services/auth.service";

export const useFullUserData = (uid) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a

  // ✅ 1. Hooks must be at the TOP LEVEL
  const dataState = useRef({ profile: {}, roleData: {}, account: {} });

  const updateCombinedState = useCallback(() => {
<<<<<<< HEAD
    const combinedData = {
      uid,
      ...dataState.current.profile,
      role: dataState.current.roleData?.role || ROLES.RESIDENT,
      status: dataState.current.account?.status || "active",
      requiresPasswordChange: dataState.current.account?.requiresPasswordChange || false,
      isPrivate: dataState.current.roleData?.isPrivate || false,
    };
    dispatch({ type: "SET_DATA", payload: combinedData });
  }, [uid]);

  useEffect(() => {
    // Reset states for the new UID
    dispatch({ type: "RESET", uid });

    if (!uid) return;

    // ✅ Reset the ref when UID changes
=======
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
      setLoading(false);
      setUserData(null);
      return;
    }

    setLoading(true);
    setError(null);

    // ✅ 2. Reset the ref when UID changes to avoid showing old data
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
    dataState.current = { profile: {}, roleData: {}, account: {} };

    const refs = {
      user: ref(db, `users/${uid}`),
      role: ref(db, `roles/${uid}`),
      account: ref(db, `accounts/${uid}`),
    };

    const handleError = (err) => {
      const code = err?.code || err?.message || "default";
<<<<<<< HEAD
      const message = AUTH_ERROR_MESSAGES[code] || AUTH_ERROR_MESSAGES.default;
      dispatch({ type: "SET_ERROR", payload: new appError(message, true, code) });
    };

    // ✅ 3. Correctly updating .current in listeners
    const unsubUser = onValue(
      refs.user,
      (snap) => {
        dataState.current.profile = snap.val() || {};
        updateCombinedState();
      },
      handleError
    );

    const unsubRole = onValue(
      refs.role,
      (snap) => {
        dataState.current.roleData = snap.val() || {};
        updateCombinedState();
      },
      handleError
    );

    const unsubAccount = onValue(
      refs.account,
      (snap) => {
        dataState.current.account = snap.val() || {};
        updateCombinedState();
      },
      handleError
    );
=======
      setError(AUTH_ERROR_MESSAGES[code] || AUTH_ERROR_MESSAGES.default);
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
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a

    return () => {
      unsubUser();
      unsubRole();
      unsubAccount();
    };
<<<<<<< HEAD
  }, [uid, updateCombinedState]);

  return { userData: state.userData, loading: state.loading, error: state.error };
};
=======
  }, [uid, updateCombinedState]); // ✅ Added updateCombinedState as dependency

  return { userData, loading, error };
};
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
