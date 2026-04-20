import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { subscribeToAuthChanges, getFullUserData, logoutUser } from "../services/auth.service";
import { USER_STATUS } from "../services/user.service"; 

import { appError } from "../utils/appError";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new appError("useAuth must be used within an AuthProvider", false, "auth/context-missing");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // Firebase Auth User
  const [user, setUser] = useState(null);               // Flattened DB Data (Role, Status, Profile)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      setLoading(true); 

      try {
        if (firebaseUser) {
          const data = await getFullUserData(firebaseUser.uid);
          setCurrentUser(firebaseUser);
          setUser(data || null);
        } else {
          setCurrentUser(null);
          setUser(null);
        }
      } catch (error) {
        console.error("Auth Sync Error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Memoized Helpers for App.jsx and ProtectedRoute
  const value = useMemo(() => ({
    currentUser,
    user, 
    userRole: user?.role || null,
    accountStatus: user?.status || null,
    
    // Security Flags
    isDisabled: user?.status === USER_STATUS.DISABLED, 
    mustChangePassword: user?.requiresPasswordChange || false,
    
    // Permission Helpers
    isSuperAdmin: user?.role === "superAdmin",
    isAdmin: user?.role === "admin" || user?.role === "superAdmin",
    
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