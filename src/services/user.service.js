<<<<<<< HEAD
import { db, auth } from "../firebaseConfig";
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
import { ROLES } from "../constants/roles";
import { appError } from "../utils/appError";
import { getUserClaims } from "./auth.service";
import { logActivity } from "./audit.service";
import { createNotification, NOTIFICATION_TYPES } from "./notification.service";
=======
import { db } from "../firebaseConfig";
import { 
  ref, 
  update, 
  serverTimestamp, 
  onValue, 
  query, 
  orderByChild, 
  get,
  equalTo 
} from "firebase/database";
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a

// Error Handling
export const USER_STATUS = Object.freeze({
  ACTIVE: "active",
  DISABLED: "disabled",
  SUSPENDED: "suspended",
});

const DB_ERRORS = Object.freeze({
<<<<<<< HEAD
  MISSING_UID: "Safety Check: User identification required for setup.",
  MISSING_DATA: "Safety Check: Form data is incomplete.",
  PROVISION_FAILED: "Server Error: Could not complete the account setup.",
  FETCH_FAILED: "Server Error: Could not retrieve the requested profile.",
  UPDATE_FAILED: "Server Error: Could not save recent changes.",
});

const adminString = import.meta.env.VITE_SUPER_ADMIN_EMAILS || "";
const adminList = adminString.split(",").map((email) => email.trim().toLowerCase());

/**
 * INTERNAL GUARD: Verifies Admin clearance via Token Claims with DB Fallback
 */
const verifyAdminClearance = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new appError("Authentication required.", true, "auth/unauthorized");

  // 1. Authoritative Tier: Check Custom Token Claims
  const claims = await getUserClaims(currentUser);
  if (claims?.admin || claims?.superAdmin) return true;

  // 2. Database Tier: Check /roles/ node (Fallback for purely client-side sync)
  try {
    const roleSnap = await get(ref(db, `roles/${currentUser.uid}`));
    const roleData = roleSnap.val();
    if (roleData?.role === ROLES.ADMIN || roleData?.role === ROLES.SUPER_ADMIN) {
      return true;
    }
  } catch {
    // Ignore DB errors here and move to emergency fallback
  }

  // 3. Emergency Tier: Check against VITE_SUPER_ADMIN_EMAILS list
  const cleanEmail = currentUser.email?.toLowerCase().trim();
  if (cleanEmail && adminList.includes(cleanEmail)) {
    return true;
  }

  throw new appError(
    "Access Denied: Administrative clearance required.",
    true,
    "auth/insufficient-clearance"
  );
};

/**
 * SCHEMA VALIDATION & SANITIZATION
 * Ensures only allowed fields are sent to Firebase.
 */
const sanitizeUserData = (data) => {
  const cleanEmail = data.email?.toLowerCase().trim() || "";

  return {
    firstName: data.firstName?.toString().trim().substring(0, 50) || "",
    middleName: data.middleName?.toString().trim().substring(0, 50) || "",
    lastName: data.lastName?.toString().trim().substring(0, 50) || "",
    suffix: data.suffix?.toString().trim().substring(0, 10) || "",
    birthDate: data.birthDate || "",
    gender: ["Male", "Female", "Other", "Not Specified"].includes(data.gender)
      ? data.gender
      : "Not Specified",
    email: cleanEmail,
    mobileNum: data.mobileNum?.toString().trim() || "N/A",
    address: {
      street: data.street?.toString().trim() || "Unset",
      baranggay: data.baranggay?.toString().trim() || "Unset",
      municipality: data.municipality?.toString().trim() || "Unset",
      cityProvince: data.cityProvince?.toString().trim() || "Unset",
      region: data.region?.toString().trim() || "Unset",
      zipCode: data.zipCode?.toString().trim() || "",
    },
=======
  MISSING_UID: "Safety Check: User ID is required to provision data.",
  MISSING_DATA: "Safety Check: Form data is incomplete.",
  PROVISION_FAILED: "Server Error: Could not initialize user tables.",
  FETCH_FAILED: "Server Error: Could not retrieve user profile.",
  UPDATE_FAILED: "Server Error: Could not update status."
});

const adminString = import.meta.env.VITE_SUPER_ADMIN_EMAILS || "";
const adminList = adminString.split(",").map(email => email.trim().toLowerCase());

const sanitizeUserData = (data) => {
  const cleanEmail = data.email?.toLowerCase().trim() || "";
  
  return {
    firstName: data.firstName?.trim() || "",
    middleName: data.middleName?.trim() || "",
    lastName: data.lastName?.trim() || "",
    suffix: data.suffix?.trim() || "",
    age: parseInt(data.age) || 0,
    gender: data.gender || "Not Specified",
    email: cleanEmail,
    userName: data.userName?.trim() || `user_${Date.now()}`,
    mobileNum: data.mobileNum || "N/A",
    address: {
      street: data.street || "Unset",
      baranggay: data.baranggay || "Unset",
      cityProvince: data.cityProvince || "Unset",
      region: data.region || "Unset",
      zipCode: data.zipCode || ""
    }
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
  };
};

// PROVISIONING: Atomic multi-path update.
<<<<<<< HEAD

export const provisionUserSystem = async (uid, formData) => {
  if (!uid) throw new appError(DB_ERRORS.MISSING_UID, true, "db/missing-uid");
  if (!formData?.role) throw new appError(DB_ERRORS.MISSING_DATA, true, "db/missing-data");

  // 🛡️ SECONDARY ROLE CHECK: Authoritative Token Verification
  await verifyAdminClearance();

  // Security Guard: Verify if the requested role is actually allowed for this email
  const inputEmail = formData.email?.toLowerCase().trim();
  const isActualSuperAdmin = formData.role === ROLES.SUPER_ADMIN && adminList.includes(inputEmail);
  const finalRole = isActualSuperAdmin ? ROLES.SUPER_ADMIN : formData.role || ROLES.RESIDENT;
=======
 
export const provisionUserSystem = async (uid, formData) => {
  if (!uid) throw new Error(DB_ERRORS.MISSING_UID);
  if (!formData?.role) throw new Error(DB_ERRORS.MISSING_DATA);

  // Security Guard: Verify if the requested role is actually allowed for this email
  const inputEmail = formData.email?.toLowerCase().trim();
  const isActualSuperAdmin = formData.role === "superAdmin" && adminList.includes(inputEmail);
  const finalRole = isActualSuperAdmin ? "superAdmin" : (formData.role || "user");
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a

  const cleanProfile = sanitizeUserData(formData);
  const now = serverTimestamp();

  const updates = {
    // NODE: Profile Info
    [`/users/${uid}`]: {
      ...cleanProfile,
<<<<<<< HEAD
      updatedAt: now,
    },
    // NODE: Account Status & Security Flags
    [`/accounts/${uid}`]: {
      status: USER_STATUS.ACTIVE,
      requiresPasswordChange: !isActualSuperAdmin,
      createdAt: now,
    },
    // NODE: Authorization
    [`/roles/${uid}`]: {
      role: finalRole,
      isPrivate: isActualSuperAdmin,
      updatedAt: now,
    },
=======
      isPrivate: isActualSuperAdmin,
      updatedAt: now
    },
    // NODE: Account Status & Security Flags
    [`/accounts/${uid}`]: {
      userId: uid,
      userName: cleanProfile.userName,
      status: USER_STATUS.ACTIVE,
      requiresPasswordChange: !isActualSuperAdmin,
      isPrivate: isActualSuperAdmin,
      createdAt: now
    },
    // NODE: Authorization (Source of Truth for Rules)
    [`/roles/${uid}`]: {
      role: finalRole,
      isPrivate: isActualSuperAdmin,
      updatedAt: now
    }
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
  };

  try {
    await update(ref(db), updates);
<<<<<<< HEAD
    await logActivity(
      "USER_PROVISIONED",
      uid,
      `User ${cleanProfile.email} provisioned with role: ${finalRole}`
    );
    return { success: true };
  } catch {
    throw new appError(DB_ERRORS.PROVISION_FAILED, true, "db/provision-failed");
=======
    return { success: true };
  } catch (error) {
    throw new Error(DB_ERRORS.PROVISION_FAILED);
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
  }
};

// READER: Real-time subscription.
export const subscribeToAllUsers = (callback, targetRole = null, onError = null) => {
  const rolesRef = ref(db, "roles");
<<<<<<< HEAD
  const usersRef = ref(db, "users");
  const accountsRef = ref(db, "accounts");
=======
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a

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

<<<<<<< HEAD
      try {
        // Optimization: Fetch Users and Accounts collections in parallel once
        const [usersSnap, accountsSnap] = await Promise.all([get(usersRef), get(accountsRef)]);

        const allUsers = usersSnap.val() || {};
        const allAccounts = accountsSnap.val() || {};
        const results = [];

        snapshot.forEach((childSnapshot) => {
          const uid = childSnapshot.key;
          const roleData = childSnapshot.val();

          // Privacy Guard & Hydration
          if (targetRole === ROLES.SUPER_ADMIN || !roleData.isPrivate) {
            const profileData = allUsers[uid] || {};
            const accountData = allAccounts[uid] || {};

            results.push({
              id: uid,
              uid: uid, // for compatibility
              ...roleData,
              ...profileData,
              status: accountData.status || "active",
              requiresPasswordChange: accountData.requiresPasswordChange || false,
            });
          }
        });

        callback(results);
      } catch (err) {
        if (onError) onError(err);
      }
    },
    () => {
      if (onError) onError(new appError(DB_ERRORS.FETCH_FAILED, true, "db/fetch-failed"));
=======
      const hydrationPromises = [];

      snapshot.forEach((childSnapshot) => {
        const uid = childSnapshot.key;
        const roleData = childSnapshot.val();

        // Privacy Guard
        if (targetRole === "superAdmin" || !roleData.isPrivate) {
          
          // 2. Hydrate: Use the UID key to fetch profile details from the /users node
          const userProfilePromise = get(ref(db, `users/${uid}`))
            .then((userSnapshot) => {
              const profileData = userSnapshot.exists() ? userSnapshot.val() : {};
              
              return {
                id: uid,
                ...roleData,    // Contains role, isPrivate, updatedAt
                ...profileData, // Contains firstName, lastName, email, etc.
              };
            })
            .catch(() => {
              // Fallback if profile fetch fails: gracefully return just the role data
              return { id: uid, ...roleData };
            });

          hydrationPromises.push(userProfilePromise);
        }
      });

      // 3. Wait for all profile lookups to resolve before sending back to UI
      const completeList = await Promise.all(hydrationPromises);
      callback(completeList);
    },
    (error) => {
      if (onError) onError(error);
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
    }
  );
};

// STATUS MANAGEMENT: Ensures all nodes stay in sync.
<<<<<<< HEAD

export const updateUserStatus = async (uid, newStatus) => {
  if (!uid) throw new appError(DB_ERRORS.FETCH_FAILED, true, "db/missing-uid");

  // 🛡️ SECONDARY ROLE CHECK: Authoritative Token Verification
  await verifyAdminClearance();

  if (!Object.values(USER_STATUS).includes(newStatus)) {
    throw new appError(`Invalid status type: ${newStatus}`, true, "db/invalid-status");
=======
 
export const updateUserStatus = async (uid, newStatus) => {
  if (!uid) throw new Error(DB_ERRORS.FETCH_FAILED);
  if (!Object.values(USER_STATUS).includes(newStatus)) {
    throw new Error(`Invalid status type: ${newStatus}`);
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
  }

  const now = serverTimestamp();

  const updates = {
    [`/accounts/${uid}/status`]: newStatus,
<<<<<<< HEAD
    [`/accounts/${uid}/updatedAt`]: now,
=======
    [`/accounts/${uid}/updatedAt`]: now
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
  };

  try {
    await update(ref(db), updates);
<<<<<<< HEAD

    // AUDIT HARDENING: Log the status change
    await logActivity(
      `user_${newStatus}`,
      uid,
      `Administrative override: Account status changed to ${newStatus}`
    );

    // NOTIFICATION: Notify the user about their account status change
    await createNotification(
      uid,
      "Account Status Update",
      `Your account has been ${newStatus === USER_STATUS.ACTIVE ? "restored" : "disabled"} by a system administrator.`,
      newStatus === USER_STATUS.ACTIVE ? NOTIFICATION_TYPES.INFO : NOTIFICATION_TYPES.WARNING
    );

    return { success: true };
  } catch (error) {
    if (error instanceof appError) throw error;
    throw new appError(DB_ERRORS.UPDATE_FAILED, true, "db/update-failed");
  }
};

/**
 * UPDATES USER PROFILE
 * Now secures the UID source and validates fields.
 */
export const updateUserProfile = async (targetUid, formData) => {
  const currentUser = auth.currentUser;

  // 🛡️ SECURITY: Use targetUid for admin edits, but fallback to currentUser for self-edits
  const uid = targetUid || currentUser?.uid;

  if (!uid)
    throw new appError("User identification required for profile update.", true, "db/missing-uid");

  // 🛡️ SECONDARY ROLE CHECK: If editing someone else, must be admin
  if (targetUid && targetUid !== currentUser?.uid) {
    await verifyAdminClearance();
  }

  // 🛡️ SANITIZATION: Prevents NoSQL injection by only mapping known fields
  const clean = sanitizeUserData(formData);

  const updates = {
    [`/users/${uid}/firstName`]: clean.firstName,
    [`/users/${uid}/middleName`]: clean.middleName,
    [`/users/${uid}/lastName`]: clean.lastName,
    [`/users/${uid}/suffix`]: clean.suffix,
    [`/users/${uid}/birthDate`]: clean.birthDate,
    [`/users/${uid}/gender`]: clean.gender,
    [`/users/${uid}/mobileNum`]: clean.mobileNum,
    [`/users/${uid}/address/street`]: clean.address.street,
    [`/users/${uid}/address/baranggay`]: clean.address.baranggay,
    [`/users/${uid}/address/municipality`]: clean.address.municipality,
    [`/users/${uid}/address/cityProvince`]: clean.address.cityProvince,
    [`/users/${uid}/address/region`]: clean.address.region,
    [`/users/${uid}/address/zipCode`]: clean.address.zipCode,
    [`/users/${uid}/updatedAt`]: serverTimestamp(),
  };

  try {
    await update(ref(db), updates);
    return { success: true };
  } catch (error) {
    if (error instanceof appError) throw error;
    throw new appError("Server Error: Could not update profile info.", true, "db/update-failed");
  }
};
=======
    return { success: true };
  } catch (error) {
    throw new Error(DB_ERRORS.UPDATE_FAILED);
  }
};

export const updateUserProfile = async (uid, formData) => {
  if (!uid) throw new Error("User ID is required.");

  const updates = {
    [`/users/${uid}/firstName`]: formData.firstName?.trim() || "",
    [`/users/${uid}/middleName`]: formData.middleName?.trim() || "",
    [`/users/${uid}/lastName`]: formData.lastName?.trim() || "",
    [`/users/${uid}/suffix`]: formData.suffix?.trim() || "",
    [`/users/${uid}/age`]: parseInt(formData.age) || 0,
    [`/users/${uid}/gender`]: formData.gender || "Not Specified",
    [`/users/${uid}/mobileNum`]: formData.mobileNum?.trim() || "N/A",
    [`/users/${uid}/address/street`]: formData.street?.trim() || "Unset",
    [`/users/${uid}/address/baranggay`]: formData.baranggay?.trim() || "Unset",
    [`/users/${uid}/address/cityProvince`]: formData.cityProvince?.trim() || "Unset",
    [`/users/${uid}/address/region`]: formData.region?.trim() || "Unset",
    [`/users/${uid}/address/zipCode`]: formData.zipCode?.trim() || "",
    [`/users/${uid}/updatedAt`]: serverTimestamp()
  };

  try {
    await update(ref(db), updates); // Gumagamit ng Atomic Multi-path Update
    return { success: true };
  } catch (error) {
    throw new Error("Server Error: Could not update profile info.");
  }
};
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
