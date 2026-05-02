import { db, auth } from "../firebaseConfig";
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
import { ROLES } from "../constants/roles";
import { appError } from "../utils/appError";
import { getUserClaims } from "./auth.service";
import { logActivity } from "./audit.service";

// Error Handling
export const USER_STATUS = Object.freeze({
  ACTIVE: "active",
  DISABLED: "disabled",
  SUSPENDED: "suspended",
});

const DB_ERRORS = Object.freeze({
  MISSING_UID: "Safety Check: User ID is required to provision data.",
  MISSING_DATA: "Safety Check: Form data is incomplete.",
  PROVISION_FAILED: "Server Error: Could not initialize user tables.",
  FETCH_FAILED: "Server Error: Could not retrieve user profile.",
  UPDATE_FAILED: "Server Error: Could not update status."
});

const adminString = import.meta.env.VITE_SUPER_ADMIN_EMAILS || "";
const adminList = adminString.split(",").map(email => email.trim().toLowerCase());

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
  } catch (_dbError) {
    // Ignore DB errors here and move to emergency fallback
  }

  // 3. Emergency Tier: Check against VITE_SUPER_ADMIN_EMAILS list
  const cleanEmail = currentUser.email?.toLowerCase().trim();
  if (cleanEmail && adminList.includes(cleanEmail)) {
    return true;
  }

  throw new appError("Access Denied: Administrative clearance required.", true, "auth/insufficient-clearance");
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
    age: Math.max(0, Math.min(120, parseInt(data.age) || 0)),
    gender: ["Male", "Female", "Other", "Not Specified"].includes(data.gender) ? data.gender : "Not Specified",
    email: cleanEmail,
    userName: data.userName?.toString().trim().substring(0, 30) || `user_${Date.now()}`,
    mobileNum: data.mobileNum?.toString().trim() || "N/A",
    address: {
      street: data.street?.toString().trim() || "Unset",
      baranggay: data.baranggay?.toString().trim() || "Unset",
      cityProvince: data.cityProvince?.toString().trim() || "Unset",
      region: data.region?.toString().trim() || "Unset",
      zipCode: data.zipCode?.toString().trim() || ""
    }
  };
};

// PROVISIONING: Atomic multi-path update.
 
export const provisionUserSystem = async (uid, formData) => {
  if (!uid) throw new appError(DB_ERRORS.MISSING_UID, true, "db/missing-uid");
  if (!formData?.role) throw new appError(DB_ERRORS.MISSING_DATA, true, "db/missing-data");

  // 🛡️ SECONDARY ROLE CHECK: Authoritative Token Verification
  await verifyAdminClearance();

  // Security Guard: Verify if the requested role is actually allowed for this email
  const inputEmail = formData.email?.toLowerCase().trim();
  const isActualSuperAdmin = formData.role === ROLES.SUPER_ADMIN && adminList.includes(inputEmail);
  const finalRole = isActualSuperAdmin ? ROLES.SUPER_ADMIN : (formData.role || ROLES.RESIDENT);

  const cleanProfile = sanitizeUserData(formData);
  const now = serverTimestamp();

  const updates = {
    // NODE: Profile Info
    [`/users/${uid}`]: {
      ...cleanProfile,
      updatedAt: now
    },
    // NODE: Account Status & Security Flags
    [`/accounts/${uid}`]: {
      status: USER_STATUS.ACTIVE,
      requiresPasswordChange: !isActualSuperAdmin,
      createdAt: now
    },
    // NODE: Authorization
    [`/roles/${uid}`]: {
      role: finalRole,
      isPrivate: isActualSuperAdmin,
      updatedAt: now
    }
  };

  try {
    await update(ref(db), updates);
    await logActivity('USER_PROVISIONED', uid, `User ${cleanProfile.email} provisioned with role: ${finalRole}`);
    return { success: true };
  } catch (_error) {
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
        if (targetRole === ROLES.SUPER_ADMIN || !roleData.isPrivate) {
          
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
              return { id: uid, ...roleData };
            });

          hydrationPromises.push(userProfilePromise);
        }
      });

      // 3. Wait for all profile lookups to resolve before sending back to UI
      const completeList = await Promise.all(hydrationPromises);
      callback(completeList);
    },
    (_error) => {
      if (onError) onError(new appError(DB_ERRORS.FETCH_FAILED, true, "db/fetch-failed"));
    }
  );
};


// STATUS MANAGEMENT: Ensures all nodes stay in sync.
 
export const updateUserStatus = async (uid, newStatus) => {
  if (!uid) throw new appError(DB_ERRORS.FETCH_FAILED, true, "db/missing-uid");

  // 🛡️ SECONDARY ROLE CHECK: Authoritative Token Verification
  await verifyAdminClearance();

  if (!Object.values(USER_STATUS).includes(newStatus)) {
    throw new appError(`Invalid status type: ${newStatus}`, true, "db/invalid-status");
  }

  const now = serverTimestamp();

  const updates = {
    [`/accounts/${uid}/status`]: newStatus,
    [`/accounts/${uid}/updatedAt`]: now
  };

  try {
    await update(ref(db), updates);
    
    // AUDIT HARDENING: Log the status change
    await logActivity(`user_${newStatus}`, uid, `Administrative override: Account status changed to ${newStatus}`);
    
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

  if (!uid) throw new appError("User identification required for profile update.", true, "db/missing-uid");

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
    [`/users/${uid}/age`]: clean.age,
    [`/users/${uid}/gender`]: clean.gender,
    [`/users/${uid}/mobileNum`]: clean.mobileNum,
    [`/users/${uid}/address/street`]: clean.address.street,
    [`/users/${uid}/address/baranggay`]: clean.address.baranggay,
    [`/users/${uid}/address/cityProvince`]: clean.address.cityProvince,
    [`/users/${uid}/address/region`]: clean.address.region,
    [`/users/${uid}/address/zipCode`]: clean.address.zipCode,
    [`/users/${uid}/updatedAt`]: serverTimestamp()
  };

  try {
    await update(ref(db), updates);
    return { success: true };
  } catch (error) {
    if (error instanceof appError) throw error;
    throw new appError("Server Error: Could not update profile info.", true, "db/update-failed");
  }
};
