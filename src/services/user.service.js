import { db } from "../firebaseConfig";
import {
  ref,
  update,
  serverTimestamp,
  onValue,
  query,
  orderByChild,
  get,
  equalTo,
} from "firebase/database";
import { appError } from "../utils/appError";
import { logActivity } from "./audit.service";

// Error Handling
export const USER_STATUS = Object.freeze({
  ACTIVE: "active",
  DISABLED: "disabled",
  SUSPENDED: "suspended",
});

const DB_ERRORS = Object.freeze({
  MISSING_UID: "Safety Check: Account identifier is required to set up data.",
  MISSING_DATA: "Safety Check: The registration form is incomplete.",
  PROVISION_FAILED: "System Error: Could not set up the user account records. Please try again.",
  FETCH_FAILED: "System Error: Could not retrieve the user profile.",
  UPDATE_FAILED: "System Error: Could not update account status.",
});

const SUPER_ADMIN_EMAIL = import.meta.env.VITE_SUPER_ADMIN_EMAIL;

const sanitizeUserData = (data) => {
  const cleanEmail = data.email?.toLowerCase().trim() || "";

  return {
    firstName: data.firstName?.trim() || "",
    middleName: data.middleName?.trim() || "",
    lastName: data.lastName?.trim() || "",
    suffix: data.suffix?.trim() || "",
    gender: data.gender || "Not Specified",
    email: cleanEmail,
    userName: data.userName?.trim() || `user_${Date.now()}`,
    mobileNum: data.mobileNum || "N/A",
    address: {
      street: data.street || "Unset",
      baranggay: data.baranggay || "Unset",
      cityProvince: data.cityProvince || "Unset",
      region: data.region || "Unset",
      zipCode: data.zipCode || "",
    },
  };
};

// PROVISIONING: Atomic multi-path update.
export const provisionUserSystem = async (uid, formData) => {
  if (!uid) throw new appError(DB_ERRORS.MISSING_UID, true, "db/missing-uid");
  if (!formData?.role) throw new appError(DB_ERRORS.MISSING_DATA, true, "db/missing-data");

  // Security Guard: Verify if the requested role is actually allowed for this email
  const inputEmail = formData.email?.toLowerCase().trim();
  const isActualSuperAdmin = formData.role === "superAdmin" && inputEmail === SUPER_ADMIN_EMAIL;
  const finalRole = isActualSuperAdmin ? "superAdmin" : formData.role || "user";

  const cleanProfile = sanitizeUserData(formData);
  const now = serverTimestamp();

  const updates = {
    // NODE: Profile Info
    [`users/${uid}`]: {
      ...cleanProfile,
      isPrivate: isActualSuperAdmin,
      updatedAt: now,
    },
    // NODE: Account Status & Security Flags
    [`accounts/${uid}`]: {
      userId: uid,
      userName: cleanProfile.userName,
      status: USER_STATUS.ACTIVE,
      requiresPasswordChange: !isActualSuperAdmin,
      isPrivate: isActualSuperAdmin,
      createdAt: now,
    },
    // NODE: Authorization (Source of Truth for Rules)
    [`roles/${uid}`]: {
      role: finalRole,
      isPrivate: isActualSuperAdmin,
      updatedAt: now,
    },
  };

  try {
    await update(ref(db), updates);
    await logActivity(
      "USER_PROVISIONED",
      uid,
      `User ${cleanProfile.email} provisioned with role: ${finalRole}`,
      { severity: "low" }
    );
    return { success: true };
  } catch {
    throw new appError(DB_ERRORS.PROVISION_FAILED, true, "db/provision-failed");
  }
};

// READER: Real-time subscription.
export const subscribeToAllUsers = (callback, targetRole = null, onError = null) => {
  const rolesRef = ref(db, "roles");

  const roleQuery = targetRole
    ? query(rolesRef, orderByChild("role"), equalTo(targetRole))
    : rolesRef;

  // 1. Listen for real-time changes on the ROLES node
  return onValue(
    roleQuery,
    async (snapshot) => {
      if (!snapshot.exists()) {
        return callback([]);
      }

      const hydrationPromises = [];

      snapshot.forEach((childSnapshot) => {
        const uid = childSnapshot.key;
        const roleData = childSnapshot.val();

        // Privacy Guard
        if (targetRole === "superAdmin" || !roleData.isPrivate) {
          // 2. Hydrate: Use the UID key to fetch profile details and account status
          const hydrationTask = Promise.all([
            get(ref(db, `users/${uid}`)),
            get(ref(db, `accounts/${uid}`)),
          ])
            .then(([userSnapshot, accountSnapshot]) => {
              const profileData = userSnapshot.exists() ? userSnapshot.val() : {};
              const accountData = accountSnapshot.exists() ? accountSnapshot.val() : {};

              return {
                id: uid,
                uid: uid, // Ensuring both are available
                ...roleData, // Contains role, isPrivate, updatedAt
                ...profileData, // Contains firstName, lastName, email, etc.
                ...accountData, // Contains status, createdAt, userName
              };
            })
            .catch(() => {
              // Fallback if fetch fails: gracefully return just the role data
              return { id: uid, uid: uid, ...roleData };
            });

          hydrationPromises.push(hydrationTask);
        }
      });

      // 3. Wait for all profile lookups to resolve before sending back to UI
      const completeList = await Promise.all(hydrationPromises);
      callback(completeList);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
};

// STATUS MANAGEMENT: Ensures all nodes stay in sync.
export const updateUserStatus = async (uid, newStatus) => {
  if (!uid) throw new appError(DB_ERRORS.FETCH_FAILED, true, "db/missing-uid");

  if (!Object.values(USER_STATUS).includes(newStatus)) {
    throw new appError(`Invalid status type: ${newStatus}`, true, "db/invalid-status");
  }

  const now = serverTimestamp();

  const updates = {
    [`accounts/${uid}/status`]: newStatus,
    [`accounts/${uid}/updatedAt`]: now,
  };

  try {
    await update(ref(db), updates);
    // 🛡️ UNIFIED AUDIT LOG: Record status change
    await logActivity(
      `USER_${newStatus.toUpperCase()}`,
      uid,
      `User account status updated to ${newStatus}`,
      { severity: "medium" }
    );
    return { success: true };
  } catch {
    throw new appError(DB_ERRORS.UPDATE_FAILED, true, "db/update-failed");
  }
};

export const updateUserProfile = async (uid, formData) => {
  if (!uid) throw new appError("User ID is required.", true, "db/missing-uid");

  const updates = {
    [`users/${uid}/firstName`]: formData.firstName?.trim() || "",
    [`users/${uid}/middleName`]: formData.middleName?.trim() || "",
    [`users/${uid}/lastName`]: formData.lastName?.trim() || "",
    [`users/${uid}/suffix`]: formData.suffix?.trim() || "",
    [`users/${uid}/gender`]: formData.gender || "Not Specified",
    [`users/${uid}/mobileNum`]: formData.mobileNum?.trim() || "N/A",
    [`users/${uid}/address/street`]: formData.street?.trim() || "Unset",
    [`users/${uid}/address/baranggay`]: formData.baranggay?.trim() || "Unset",
    [`users/${uid}/address/cityProvince`]: formData.cityProvince?.trim() || "Unset",
    [`users/${uid}/address/region`]: formData.region?.trim() || "Unset",
    [`users/${uid}/address/zipCode`]: formData.zipCode?.trim() || "",
    [`users/${uid}/updatedAt`]: serverTimestamp(),
  };

  try {
    await update(ref(db), updates); // Gumagamit ng Atomic Multi-path Update
    await logActivity("PROFILE_UPDATED", uid, "User profile information updated.", {
      severity: "medium",
    });
    return { success: true };
  } catch {
    throw new appError("Server Error: Could not update profile info.", true, "db/update-failed");
  }
};

/**
 * Subscribes to a specific user's profile updates.
 */
export const subscribeToUserProfile = (uid, callback, onError = null) => {
  if (!uid) return null;
  const userRef = ref(db, `users/${uid}`);

  return onValue(
    userRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        if (onError) onError(new appError("Profile not found.", true, "db/not-found"));
      }
    },
    (err) => {
      if (onError) onError(err);
    }
  );
};
