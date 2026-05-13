import { ref, push, serverTimestamp } from "firebase/database";
import { db } from "../firebaseConfig";
<<<<<<< HEAD
import { logger } from "../utils/logger";

/**
 * Logs a login event to the Smart Aqua Realtime Database.
 * @param {string} uid - The user's Firebase UID.
=======

/**
 * Nagtatala ng login event sa Realtime Database ng Smart Aqua
 * @param {string} uid - Ang Firebase UID ng user
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
 */
export const logLoginSession = async (uid) => {
  if (!uid) return;

<<<<<<< HEAD
  const userAgent = navigator.userAgent;
=======
  const userAgent = navigator.userAgent; // Kukuha ng browser/OS profile
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
  const sessionLogsRef = ref(db, `/accounts/${uid}/loginHistory`);

  const newSession = {
    loginAt: serverTimestamp(),
<<<<<<< HEAD
    device: parseUserAgent(userAgent), 
    userAgent: userAgent,
=======
    device: parseUserAgent(userAgent), // Mas malinis na Device Name
    userAgent: userAgent, // Buong Metadata para sa forensic audits
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
  };

  try {
    await push(sessionLogsRef, newSession);
  } catch (error) {
<<<<<<< HEAD
    logger.error("Failed to log session:", error);
  }
};

// Helper: Makes the User Agent string more readable
=======
    console.error("Failed to log session:", error);
    // HINDI tayo nag-u-unhandled throw dito para iwas downtime sa login page
  }
};

// Helper: Upang gawing readable ang mahabang User Agent string
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
const parseUserAgent = (ua) => {
  if (ua.includes("Mobile") || ua.includes("Android") || ua.includes("iPhone")) return "Mobile Device";
  if (ua.includes("Windows")) return "Windows Desktop";
  if (ua.includes("Macintosh")) return "MacBook / iMac";
  if (ua.includes("Linux")) return "Linux Desktop";
  return "Unknown Device";
};