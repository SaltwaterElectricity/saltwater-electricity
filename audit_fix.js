import {
  ref,
  push,
  get,
  serverTimestamp,
  onValue,
  query,
  limitToLast,
  orderByChild,
} from "firebase/database";
import { auth, db } from "../firebaseConfig";
import { appError } from "../utils/appError";
import { logger } from "../utils/logger";

export const logActivity = async (
  action,
  targetId,
  details,
  { actorUid = null, status = "success", severity = "informational" } = {}
) => {
  const currentUser = auth.currentUser;
  const effectiveUid = actorUid || currentUser?.uid;

  const adminEmail = currentUser?.email || "system@saltwaterelectricity.internal";

  try {
    const auditRef = ref(db, "audit-logs");

    let firstName = "";
    let lastName = "";
    let adminName = "System";
    let role = "System";

    if (effectiveUid && effectiveUid !== "unauthenticated") {
      try {
        const [userSnap, roleSnap] = await Promise.all([
          get(ref(db, `users/${effectiveUid}`)),
          get(ref(db, `roles/${effectiveUid}`)),
        ]);

        if (userSnap.exists()) {
          const userData = userSnap.val();
          firstName = (userData.firstName || "").trim();
          lastName = (userData.lastName || "").trim();
          const fullName = `${firstName} ${lastName}`.trim();
          adminName = fullName || userData.email?.split("@")[0] || "User";
        }

        if (roleSnap.exists()) {
          role = roleSnap.val().role || "User";
        }
      } catch (err) {
        logger.warn(`[Audit Service] Failed to fetch identity for UID: ${effectiveUid}`, err);
      }
    }

    const logEntry = {
      adminEmail,
      adminName,
      firstName,
      lastName,
      role,
      action,
      targetId,
      details,
      status,
      severity,
      ipAddress: "Terminal Client",
      createdAt: serverTimestamp(),
    };

    // ONLY add actorUid if it exists. This avoids "undefined" value error in RTDB.
    if (effectiveUid) {
      logEntry.actorUid = effectiveUid;
    }

    await push(auditRef, logEntry);

    return { success: true };
  } catch (error) {
    logger.error("[Audit Service]: Activity logging failed.", error);
    throw new appError(
      "The activity log is currently unavailable. We could not save your recent changes.",
      true,
      "audit/log-failed"
    );
  }
};

export const logLoginSuccess = async (email, uid) => {
  return await logActivity("USER_LOGIN", uid, `Session established successfully for ${email}.`, {
    actorUid: uid,
    severity: "low",
  });
};

export const logLoginFailure = async (email, reason = "Invalid credentials") => {
  return await logActivity(
    "LOGIN_FAILURE",
    "unauthenticated",
    `Failed login attempt for ${email}. Reason: ${reason}`,
    { status: "failed", severity: "medium" }
  );
};

export const logLogout = async (email, uid) => {
  if (!email || !uid) return;
  return await logActivity("USER_LOGOUT", uid, `Session terminated by user ${email}.`, {
    actorUid: uid,
    severity: "low",
  });
};

export const subscribeToAuditLogs = (limit, callback, onError = null) => {
  const logsRef = ref(db, "audit-logs");
  const logsQuery = query(logsRef, orderByChild("createdAt"), limitToLast(limit));

  return onValue(
    logsQuery,
    (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
      } else {
        const logList = Object.entries(data).map(([id, val]) => ({
          id,
          ...val,
        }));
        logList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        callback(logList);
      }
    },
    onError
  );
};
