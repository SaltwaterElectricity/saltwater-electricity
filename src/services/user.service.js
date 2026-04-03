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
  };
};

// PROVISIONING: Atomic multi-path update.
 
export const provisionUserSystem = async (uid, formData) => {
  if (!uid) throw new Error(DB_ERRORS.MISSING_UID);
  if (!formData?.role) throw new Error(DB_ERRORS.MISSING_DATA);

  // Security Guard: Verify if the requested role is actually allowed for this email
  const inputEmail = formData.email?.toLowerCase().trim();
  const isActualSuperAdmin = formData.role === "superAdmin" && adminList.includes(inputEmail);
  const finalRole = isActualSuperAdmin ? "superAdmin" : (formData.role || "user");

  const cleanProfile = sanitizeUserData(formData);
  const now = serverTimestamp();

  const updates = {
    // NODE: Profile Info
    [`/users/${uid}`]: {
      ...cleanProfile,
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
  };

  try {
    await update(ref(db), updates);
    return { success: true };
  } catch (error) {
    throw new Error(DB_ERRORS.PROVISION_FAILED);
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
    }
  );
};

// STATUS MANAGEMENT: Ensures all nodes stay in sync.
 
export const updateUserStatus = async (uid, newStatus) => {
  if (!uid) throw new Error(DB_ERRORS.FETCH_FAILED);
  if (!Object.values(USER_STATUS).includes(newStatus)) {
    throw new Error(`Invalid status type: ${newStatus}`);
  }

  const now = serverTimestamp();

  const updates = {
    [`/accounts/${uid}/status`]: newStatus,
    [`/accounts/${uid}/updatedAt`]: now
  };

  try {
    await update(ref(db), updates);
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