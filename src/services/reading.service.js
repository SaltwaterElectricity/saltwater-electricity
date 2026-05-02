import { ref, onValue, get, query, limitToLast, orderByKey, update, serverTimestamp } from "firebase/database";
import { auth, db } from "../firebaseConfig";
import { appError } from "../utils/appError";
import { getUserClaims } from "./auth.service";

/**
 * Reading Service
 * 
 * Handles real-time telemetry subscriptions and historical log retrieval.
 * Adheres to SOLID principles by separating data fetching, transformation, and error handling.
 */

/**
 * INTERNAL GUARD: Verifies device ownership or admin clearance.
 */
const verifyDeviceAccess = async (deviceId) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new appError("Authentication required.", true, "auth/unauthorized");

  // 1. Admin/SuperAdmin Bypass
  const claims = await getUserClaims(currentUser);
  if (claims?.admin || claims?.superAdmin) return true;

  // 2. Ownership Check: Verify if device is assigned to this user
  try {
    const assignmentRef = ref(db, `device_assignments/${deviceId}`);
    const snapshot = await get(assignmentRef);
    
    if (snapshot.exists()) {
      const assignment = snapshot.val();
      if (assignment.userId === currentUser.uid) return true;
    }
  } catch (_dbError) {
    // Fall through to error
  }

  throw new appError("Access Denied: You are not authorized to monitor this device.", true, "auth/insufficient-clearance");
};

/**
 * Data Transformation Configuration
 * Defines decimal precision for telemetry metrics.
 */
const PRECISION_CONFIG = {
  voltage: 2,
  tds_ppm: 1,
  bulb_ma: 2,
};

/**
 * Internal helper to format numeric readings according to PRECISION_CONFIG.
 * @param {Object} data - Raw reading data from Firebase
 * @returns {Object|null} - Transformed data
 */
const transformReading = (data) => {
  if (!data) return null;

  const transformed = { ...data };
  
  Object.keys(PRECISION_CONFIG).forEach((key) => {
    if (typeof transformed[key] === 'number') {
      // Clean data transformation: format decimals while keeping them as numbers
      transformed[key] = Number(transformed[key].toFixed(PRECISION_CONFIG[key]));
    }
  });

  return transformed;
};

/**
 * Subscribes to the 'latest' reading node for a specific device.
 * Designed to work seamlessly with hooks like useReadings.
 * 
 * @param {string} deviceId - Unique identifier for the device
 * @param {Function} onSuccess - Callback for data updates
 * @param {Function} onError - Callback for subscription errors
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToLatestReading = (deviceId, onSuccess, onError) => {
  if (!deviceId) {
    throw new appError("A valid Device ID is required to start monitoring.", true, "reading/invalid-id");
  }

  let unsubscribeNode = null;
  let isCancelled = false;

  // IDOR DEFENSE: Verify access before establishing the stream
  verifyDeviceAccess(deviceId)
    .then(() => {
      if (isCancelled) return;

      const latestRef = ref(db, `readings/${deviceId}/latest`);
      unsubscribeNode = onValue(
        latestRef,
        (snapshot) => {
          try {
            const rawData = snapshot.val();
            onSuccess(transformReading(rawData));
          } catch (_err) {
            if (onError) onError(new appError("Failed to process incoming reading.", true, "reading/parse-error"));
          }
        },
        (error) => {
          const wrappedError = new appError(
            `Real-time connection failed: ${error.message}`,
            true,
            "reading/connection-failed"
          );
          if (onError) onError(wrappedError);
        }
      );
    })
    .catch((err) => {
      if (!isCancelled && onError) onError(err);
    });

  return () => {
    isCancelled = true;
    if (unsubscribeNode) unsubscribeNode();
  };
};

/**
 * Updates the bulb state using an atomic multi-path update.
 * Synchronizes 'relay_active' and 'timestamp' across latest and logs.
 * 
 * @param {string} deviceId - ID of the device
 * @param {boolean} newState - Target ON/OFF state
 */
export const updateBulbState = async (deviceId, newState) => {
  if (!deviceId) throw new appError("Device ID required.", true, "reading/invalid-id");

  // IDOR DEFENSE: Verify access before writing hardware commands
  await verifyDeviceAccess(deviceId);

  try {
    // SCHEMA HARDENING: Fetch current tds_ppm to ensure mandatory field is present in all writes
    const latestRef = ref(db, `readings/${deviceId}/latest`);
    const snapshot = await get(latestRef);
    const currentData = snapshot.val() || {};
    const tds = currentData.tds_ppm || 0;

    const clientTs = Date.now();
    const now = serverTimestamp();
    const updates = {};
    
    // 1. Update Latest Reading Node (Removed bulb_ma)
    updates[`readings/${deviceId}/latest/relay_active`] = newState;
    updates[`readings/${deviceId}/latest/tds_ppm`] = tds;
    updates[`readings/${deviceId}/latest/timestamp`] = now;
    
    // 2. Add to Historical Logs
    updates[`logs/${deviceId}/${clientTs}/relay_active`] = newState;
    updates[`logs/${deviceId}/${clientTs}/tds_ppm`] = tds;
    updates[`logs/${deviceId}/${clientTs}/timestamp`] = now;
    
    // 3. Hardware Command Node (Anti-Replay Protection)
    updates[`commands/${deviceId}/relay`] = newState;
    updates[`commands/${deviceId}/lastUpdated`] = now;

    await update(ref(db), updates);
  } catch (error) {
    if (error instanceof appError) throw error;
    throw new appError(`Hardware command failed: ${error.message}`, true, "reading/update-failed");
  }
};

/**
 * Fetches historical logs for a device.
 * 
 * @param {string} deviceId - Unique identifier for the device
 * @param {number} limit - Maximum number of logs to retrieve
 * @returns {Promise<Array>} - List of formatted logs
 */
export const getHistoricalLogs = async (deviceId, limit = 50) => {
  if (!deviceId) {
    throw new appError("Device ID is required to fetch history.", true, "reading/invalid-parameters");
  }

  // IDOR DEFENSE: Verify access before fetching logs
  await verifyDeviceAccess(deviceId);

  const logsRef = query(
    ref(db, `logs/${deviceId}`),
    orderByKey(),
    limitToLast(limit)
  );

  try {
    const snapshot = await get(logsRef);
    if (!snapshot.exists()) return [];

    const data = snapshot.val();
    
    // Transform and normalize historical data
    return Object.entries(data)
      .map(([key, val]) => ({
        id: key,
        ...transformReading(val),
        __normalizedTs: val.timestamp || parseInt(key) || Date.now()
      }))
      .sort((a, b) => b.__normalizedTs - a.__normalizedTs);

  } catch (_error) {
    throw new appError(
      "The historical data service is currently unavailable.",
      true,
      "reading/logs-fetch-failed"
    );
  }
};

export default {
  subscribeToLatestReading,
  getHistoricalLogs
};
