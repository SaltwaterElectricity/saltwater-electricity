import { ref, push, serverTimestamp } from "firebase/database";
import { db } from "../firebaseConfig";
import { logger } from "../utils/logger";

/**
 * Logs a login event to the Smart Aqua Realtime Database.
 * @param {string} uid - The user's Firebase UID.
 */
export const logLoginSession = async (uid) => {
  if (!uid) return;

  const userAgent = navigator.userAgent;
  const sessionLogsRef = ref(db, `/accounts/${uid}/loginHistory`);

  const newSession = {
    loginAt: serverTimestamp(),
    device: parseUserAgent(userAgent), 
    userAgent: userAgent,
  };

  try {
    await push(sessionLogsRef, newSession);
  } catch (error) {
    logger.error("Failed to log session:", error);
  }
};

// Helper: Makes the User Agent string more readable
const parseUserAgent = (ua) => {
  if (ua.includes("Mobile") || ua.includes("Android") || ua.includes("iPhone")) return "Mobile Device";
  if (ua.includes("Windows")) return "Windows Desktop";
  if (ua.includes("Macintosh")) return "MacBook / iMac";
  if (ua.includes("Linux")) return "Linux Desktop";
  return "Unknown Device";
};