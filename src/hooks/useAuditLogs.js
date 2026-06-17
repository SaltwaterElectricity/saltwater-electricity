import { useState, useEffect, useRef } from "react";
import { subscribeToAuditLogs } from "../services/audit.service";
import { ref, get } from "firebase/database";
import { db } from "../firebaseConfig";
import logger from "../utils/logger";

/**
 * Hook: useAuditLogs
 * Subscribes to system audit logs and hydrates identity data from live nodes.
 * Effectively resolves stale log data by prioritizing current database state.
 *
 * @param {number} limit - Maximum number of recent logs to retrieve. Defaults to 100.
 * @returns {Object} - { logs, loading, error }
 */
export const useAuditLogs = (limit = 100) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Persistent cache to avoid redundant profile lookups across updates
  const profileCache = useRef(new Map());

  useEffect(() => {
    const unsubscribe = subscribeToAuditLogs(
      limit,
      async (logList) => {
        try {
          // HYDRATION STRATEGY: Ensure every log reflects CURRENT user data
          const hydratedLogs = await Promise.all(
            logList.map(async (log) => {
              // Priority UID: Explicit actorUid, then check targetId as fallback (Target UID for user-centric actions)
              // Firebase UIDs are exactly 28 characters
              const isLikelyUid = (id) => id && typeof id === "string" && id.length >= 20;

              const uid = isLikelyUid(log.actorUid)
                ? log.actorUid
                : isLikelyUid(log.targetId)
                  ? log.targetId
                  : null;

              // Skip hydration if no valid UID or explicitly unauthenticated
              if (!uid || uid === "unauthenticated") return log;

              // Check Cache first (Shared across the hook's lifecycle)
              if (profileCache.current.has(uid)) {
                return { ...log, ...profileCache.current.get(uid) };
              }

              try {
                // Parallel fetch for profile and role to ensure we have the LATEST "Actual" data
                const [userSnap, roleSnap] = await Promise.all([
                  get(ref(db, `users/${uid}`)),
                  get(ref(db, `roles/${uid}`)),
                ]);

                const profile = {};

                if (userSnap.exists()) {
                  const userData = userSnap.val();
                  profile.firstName = (userData.firstName || "").trim();
                  profile.lastName = (userData.lastName || "").trim();
                  profile.adminEmail = userData.email || log.adminEmail;
                  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
                  profile.adminName = fullName || userData.email?.split("@")[0] || "User";
                }

                if (roleSnap.exists()) {
                  profile.role = roleSnap.val().role || "User";
                }

                if (Object.keys(profile).length > 0) {
                  // Requirement: Overwrite log data with live account data to fix 'Stale Data'
                  profileCache.current.set(uid, profile);
                  return { ...log, ...profile };
                }
              } catch (err) {
                logger.warn(`[Audit Hydration] Failed for UID: ${uid}`, err);
              }

              return log;
            })
          );

          setLogs(hydratedLogs);
          setError(null);
          setLoading(false);
        } catch (err) {
          logger.error("[Audit Hook]: Hydration logic failed.", err);
          setLogs(logList); // Fallback to raw logs
          setLoading(false);
        }
      },
      (err) => {
        logger.error("[Audit Hook]: Subscription failed.", err);
        setError(
          new Error(
            "The activity records are currently unavailable. We're working to restore the connection."
          )
        );
        setLoading(false);
      }
    );

    return () => unsubscribe && unsubscribe();
  }, [limit]);

  return { logs, loading, error };
};
