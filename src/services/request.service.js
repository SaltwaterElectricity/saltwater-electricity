import { ref, push, serverTimestamp } from "firebase/database";
import { db } from "../firebaseConfig";
import { appError } from "../utils/appError";

/**
 * REQUEST SERVICE
 * 
 * Handles the creation and management of device-related requests.
 * Adheres to SOLID principles by focusing strictly on request 'Write' operations.
 */

/**
 * Creates a new device request in the Realtime Database.
 * 
 * @param {string} userId - The ID of the user making the request.
 * @param {Object} deviceData - Data containing request details (requestType, deviceName).
 * @returns {Promise<Object>} - The created request reference information.
 */
export const createDeviceRequest = async (userId, deviceData) => {
  if (!userId) {
    throw new appError("User identification is required to submit a request.", true, "request/missing-userid");
  }

  if (!deviceData?.requestType || !deviceData?.deviceName) {
    throw new appError("Incomplete request data. Please provide both request type and device name.", true, "request/incomplete-data");
  }

  try {
    const requestRef = ref(db, "device-requests");
    
    const newRequest = {
      userId,
      requestType: deviceData.requestType,
      deviceName: deviceData.deviceName.trim(),
      status: "pending",
      deviceId: null,
      deviceAssignId: null,
      createdAt: serverTimestamp()
    };

    const result = await push(requestRef, newRequest);

    return { 
      success: true, 
      requestId: result.key 
    };
  } catch (error) {
    if (error instanceof appError) throw error;
    
    // Wrap Firebase errors in a descriptive operational appError
    throw new appError(
      "The request service is currently unavailable. Please try again later.", 
      true, 
      "request/submission-failed"
    );
  }
};
