import { useState, useEffect, useMemo, useRef } from "react";
import { subscribeToAuthChanges, getFullUserData, logoutUser } from "../services/auth.service";
import { USER_STATUS } from "../services/user.service"; 
import { logger } from "../utils/logger";
import { AuthContext } from "./useAuth";
import { ref, onValue } from "firebase/database";
import { db } from "../firebaseConfig";
import { isSuperAdmin, isAdmin } from "../utils/rbac";

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // Firebase Auth User
  const [user, setUser] = useState(null);               // Flattened DB Data + Token Claims
  const [loading, setLoading] = useState(true);

  // Use refs to track listeners for cleanup
  const listeners = useRef({ role: null, account: null });

  // 1. Authoritative Claim Synchronization
  const syncUserContext = async (firebaseUser, forceRefresh = false) => {
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
      setLoading(false);
    }
  };

  /**
   * FORCE TOKEN REFRESH
   * Used to immediately update permissions when a role is changed.
   */
  const forceTokenRefresh = async () => {
    if (!currentUser) return;
    setLoading(true);
    await syncUserContext(currentUser, true);
  };

  useEffect(() => {
    const unsubscribeAuth = subscribeToAuthChanges((firebaseUser) => {
      setLoading(true); 

      // Cleanup existing listeners if user changes or signs out
      if (listeners.current.role) listeners.current.role();
      if (listeners.current.account) listeners.current.account();
      listeners.current = { role: null, account: null };

      if (firebaseUser) {
        syncUserContext(firebaseUser);

        // 2. REAL-TIME RBAC MONITORING
        // We listen to the DB nodes. If they change, it's likely a claim was updated by a backend process.
        const roleRef = ref(db, `roles/${firebaseUser.uid}`);
        const accountRef = ref(db, `accounts/${firebaseUser.uid}`);

        listeners.current.role = onValue(roleRef, (snapshot) => {
          // If the role node in DB changes, refresh the token to get new claims
          forceTokenRefresh();
        });

        listeners.current.account = onValue(accountRef, (snapshot) => {
          // If status changes (e.g. suspended), refresh token or re-sync
          syncUserContext(firebaseUser);
        });

      } else {
        syncUserContext(null);
      }
    });

    return () => {
      unsubscribeAuth();
      if (listeners.current.role) listeners.current.role();
      if (listeners.current.account) listeners.current.account();
    };
  }, []);

  // Memoized Helpers for App.jsx and ProtectedRoute
  const value = useMemo(() => ({
    currentUser,
    user, 
    userRole: user?.role || null,
    accountStatus: user?.status || null,
    claims: user?.claims || {},
    
    // Security Flags
    isDisabled: user?.status === USER_STATUS.DISABLED, 
    mustChangePassword: user?.requiresPasswordChange || false,
    
    // Permission Helpers
    isSuperAdmin: isSuperAdmin(user?.claims),
    isAdmin: isAdmin(user?.claims),
    
    forceTokenRefresh,
    loading
  }), [currentUser, user, loading]);

  // 2. SECURITY KILL-SWITCH: Rendered if account status changes to disabled in real-time
  if (user?.status === USER_STATUS.DISABLED) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center p-8 text-center font-sans antialiased">
        <div className="max-w-md space-y-4 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
             </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
            Access <span className="text-red-600">Denied</span>
          </h1>
          <p className="text-slate-500 font-medium leading-relaxed">
            Your <strong>SmartAqua</strong> account has been suspended. <br/>
            Contact your Facility Manager for San Andres to restore access.
          </p>
          <button onClick={() => logoutUser()} className="mt-4 font-bold uppercase text-xs tracking-widest text-slate-400">Logout</button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
