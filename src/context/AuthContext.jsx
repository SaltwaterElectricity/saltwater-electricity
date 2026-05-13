import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { subscribeToAuthChanges, getFullUserData, logoutUser } from "../services/auth.service";
import { USER_STATUS } from "../services/user.service";
import { logger } from "../utils/logger";
import { AuthContext } from "./useAuth";
import { ref, onValue } from "firebase/database";
import { db } from "../firebaseConfig";
import { ROLES } from "../constants/roles";
import { isSuperAdmin, isAdmin } from "../utils/rbac";

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // Firebase Auth User
  const [user, setUser] = useState(null); // Flattened DB Data + Token Claims
  const [loading, setLoading] = useState(true);

  // Use refs to track listeners for cleanup
  const listeners = useRef({ role: null, account: null });

  // 1. Authoritative Claim Synchronization
  const syncUserContext = useCallback(async (firebaseUser, forceRefresh = false) => {
    try {
      if (firebaseUser) {
        // Authoritative source: Decoded ID Token (optionally forced)
        const data = await getFullUserData(firebaseUser.uid, firebaseUser, forceRefresh);
        setCurrentUser(firebaseUser);
        setUser(data || null);
      } else {
        setCurrentUser(null);
        setUser(null);
      }
    } catch (error) {
      logger.error("Auth Sync Error:", error);
    } finally {
      // Only set loading to false. We don't want to set it to true
      // during background syncs to avoid flickering the global splash.
      setLoading(false);
    }
  }, []);

  /**
   * FORCE TOKEN REFRESH
   * Used to immediately update permissions when a role is changed.
   */
  const forceTokenRefresh = useCallback(async () => {
    if (!currentUser) return;
    // For background refreshes, we don't set global loading=true
    // to prevent the app from unmounting and showing the splash screen.
    await syncUserContext(currentUser, true);
  }, [currentUser, syncUserContext]);

  useEffect(() => {
    const currentListeners = listeners.current;
    const unsubscribeAuth = subscribeToAuthChanges((firebaseUser) => {
      // We don't call setLoading(true) here because it would trigger
      // the global splash screen in App.jsx and unmount the current view.
      // Initial loading is true by default, and syncUserContext will set it to false.

      if (firebaseUser) {
        syncUserContext(firebaseUser);

        // 2. REAL-TIME RBAC MONITORING
        // We listen to the DB nodes. If they change, it's likely a claim was updated by a backend process.
        const roleRef = ref(db, `roles/${firebaseUser.uid}`);
        const accountRef = ref(db, `accounts/${firebaseUser.uid}`);

        currentListeners.role = onValue(roleRef, (_snapshot) => {
          // If the role node in DB changes, refresh the token to get new claims
          forceTokenRefresh();
        });

        currentListeners.account = onValue(accountRef, (_snapshot) => {
          // If status changes (e.g. suspended), refresh token or re-sync
          syncUserContext(firebaseUser);
        });
      } else {
        syncUserContext(null);
      }
    });

    return () => {
      unsubscribeAuth();
      if (currentListeners.role) currentListeners.role();
      if (currentListeners.account) currentListeners.account();
    };
  }, [syncUserContext, forceTokenRefresh]);

  // Memoized Helpers for App.jsx and ProtectedRoute
  const value = useMemo(() => {
    // Determine authoritative status
    const status = user?.status || null;
    const role = user?.role || ROLES.RESIDENT;

    return {
      currentUser,
      user,
      userRole: role,
      accountStatus: status,
      claims: user?.claims || {},

      // Security Flags
      isDisabled: status === USER_STATUS.DISABLED,
      mustChangePassword: user?.requiresPasswordChange || false,

      // Permission Helpers (Unified Check)
      isSuperAdmin: isSuperAdmin(user),
      isAdmin: isAdmin(user),

      forceTokenRefresh,
      loading,
    };
  }, [currentUser, user, loading, forceTokenRefresh]);

  // 2. SECURITY KILL-SWITCH: Rendered if account status changes to disabled in real-time
  if (user?.status === USER_STATUS.DISABLED) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center p-8 text-center font-sans antialiased">
        <div className="max-w-md space-y-4 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
            Access <span className="text-red-600">Denied</span>
          </h1>
          <p className="text-slate-500 font-medium leading-relaxed">
            Your <strong>SmartAqua</strong> account has been suspended. <br />
            Contact your Facility Manager for San Andres to restore access.
          </p>
          <button
            onClick={() => logoutUser()}
            className="mt-4 font-bold uppercase text-xs tracking-widest text-slate-400"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
