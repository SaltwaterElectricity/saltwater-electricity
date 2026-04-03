import { ref, push, serverTimestamp } from "firebase/database";
import { db } from "../firebaseConfig";

/**
 * Nagtatala ng login event sa Realtime Database ng Smart Aqua
 * @param {string} uid - Ang Firebase UID ng user
 */
export const logLoginSession = async (uid) => {
  if (!uid) return;

  const userAgent = navigator.userAgent; // Kukuha ng browser/OS profile
  const sessionLogsRef = ref(db, `/accounts/${uid}/loginHistory`);

  const newSession = {
    loginAt: serverTimestamp(),
    device: parseUserAgent(userAgent), // Mas malinis na Device Name
    userAgent: userAgent, // Buong Metadata para sa forensic audits
  };

  try {
    await push(sessionLogsRef, newSession);
  } catch (error) {
    console.error("Failed to log session:", error);
    // HINDI tayo nag-u-unhandled throw dito para iwas downtime sa login page
  }
};

// Helper: Upang gawing readable ang mahabang User Agent string
const parseUserAgent = (ua) => {
  if (ua.includes("Mobile") || ua.includes("Android") || ua.includes("iPhone")) return "Mobile Device";
  if (ua.includes("Windows")) return "Windows Desktop";
  if (ua.includes("Macintosh")) return "MacBook / iMac";
  if (ua.includes("Linux")) return "Linux Desktop";
  return "Unknown Device";
};