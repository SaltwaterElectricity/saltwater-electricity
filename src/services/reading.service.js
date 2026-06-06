import {
  ref,
  onValue,
  get,
  query,
  limitToLast,
  orderByKey,
  startAt,
  endAt,
  update,
  serverTimestamp,
} from "firebase/database";
import { auth, db } from "../firebaseConfig";
import { appError } from "../utils/appError";
import logger from "../utils/logger";
import { getUserClaims } from "./auth.service";
import { createNotification, NOTIFICATION_TYPES } from "./notification.service";
import { logActivity } from "./audit.service";
import { SENSOR_CONFIG, METRICS, METRIC_MAP } from "../constants";

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
  } catch {
    // Fall through to error
  }

  throw new appError(
    "Access Denied: You are not authorized to monitor this device.",
    true,
    "auth/insufficient-clearance"
  );
};

/**
 * Data Transformation Configuration
 * Defines decimal precision for telemetry metrics.
 */
const PRECISION_CONFIG = {
  voltage: 2,
  tds_ppm: 1,
  bulb_ma: 2,
  esp_ma: 2,
  sensor_ma: 2,
};

/**
 * Internal helper to format numeric readings according to PRECISION_CONFIG.
 * @param {Object} data - Raw reading data from Firebase
 * @returns {Object} - Transformed data (guaranteed to have voltage, tds, current)
 */
export const transformReading = (data) => {
  // If no data, return default standby state
  if (!data || typeof data !== "object") {
    return {
      voltage: 0,
      tds: 0,
      current: 0,
      timestamp: Date.now(),
      relay_active: false,
    };
  }

  const transformed = { ...data };

  // 1. CALCULATE DERIVED METRICS: Total Current in Amps
  // Priority: 1. total_ma (if exists), 2. Sum of bulb+esp+sensor
  const rawTotalMa = transformed.total_ma;
  const bulb = Number(transformed.bulb_ma) || 0;
  const esp = Number(transformed.esp_ma) || 0;
  const sensor = Number(transformed.sensor_ma) || 0;

  const totalMa = rawTotalMa !== undefined ? Number(rawTotalMa) : bulb + esp + sensor;

  // Convert total milliamps to Amps
  transformed.current = Number((totalMa / 1000).toFixed(2));

  // 2. PRECISION FORMATTING: Ensure numbers and apply toFixed
  Object.keys(PRECISION_CONFIG).forEach((key) => {
    const val = transformed[key];
    if (val !== undefined && val !== null) {
      const num = Number(val);
      transformed[key] = isNaN(num) ? 0 : Number(num.toFixed(PRECISION_CONFIG[key]));
    }
  });

  // 3. NORMALIZATION: Map hardware-specific keys to UI-standard keys (e.g., tds_ppm -> tds)
  // Ensure we don't overwrite already calculated 'current'
  Object.entries(METRIC_MAP).forEach(([uiKey, dbKey]) => {
    if (transformed[dbKey] !== undefined && transformed[uiKey] === undefined) {
      transformed[uiKey] = transformed[dbKey];
    }
  });

  // 4. FINAL SAFETY LAYER: Ensure UI metrics are numeric zeros if still missing
  transformed.voltage = transformed.voltage ?? 0;
  transformed.tds = transformed.tds ?? 0;
  transformed.current = transformed.current ?? 0;

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
    throw new appError(
      "A valid Device identifier is required to start monitoring.",
      true,
      "reading/invalid-id"
    );
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
          } catch (error) {
            logger.error("[Reading Service]: Data transformation failed.", error);
            if (onError)
              onError(
                new appError(
                  "Data processing error: Could not interpret sensor values.",
                  true,
                  "reading/parse-error"
                )
              );
          }
        },
        (error) => {
          logger.error("[Reading Service]: Real-time connection failed.", error);
          const wrappedError = new appError(
            "Communications link interrupted. Please check your network.",
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
  if (!deviceId) throw new appError("Device identifier required.", true, "reading/invalid-id");

  // IDOR DEFENSE: Verify access before writing hardware commands
  await verifyDeviceAccess(deviceId);

  try {
    // SCHEMA HARDENING: Fetch FULL current state to preserve all telemetry fields (esp_ma, power_mode, etc.)
    const latestRef = ref(db, `readings/${deviceId}/latest`);
    const snapshot = await get(latestRef);
    const currentData = snapshot.val() || {};

    const clientTs = Date.now();
    const now = serverTimestamp();
    const updates = {};

    // 1. Prepare base reading for both latest and logs
    const baseReading = {
      ...currentData,
      relay_active: newState,
      timestamp: now,
    };

    // 2. Update Latest Reading Node (Preserves all fields: esp_ma, sensor_ma, power_mode, etc.)
    updates[`readings/${deviceId}/latest`] = baseReading;

    // 3. Add to Historical Logs
    updates[`logs/${deviceId}/${clientTs}`] = baseReading;

    // 4. Hardware Command Node (Anti-Replay Protection)
    updates[`commands/${deviceId}/relay`] = newState;
    updates[`commands/${deviceId}/lastUpdated`] = now;

    // 🛡️ UNIFIED AUDIT LOG: Record hardware control action
    await logActivity(
      "RELAY_TOGGLED",
      deviceId,
      `Hardware relay state changed to: ${newState ? "ON" : "OFF"}`,
      { severity: "low" }
    ).catch((err) => logger.error("[Reading Service]: Audit logging failed for relay toggle", err));

    // CRITICAL ALERT CHECK: Trigger notification if TDS exceeds critical threshold
    const tds = currentData.tds_ppm || 0;
    const tdsConfig = SENSOR_CONFIG[METRICS.TDS];
    if (tds >= tdsConfig.critical) {
      const userId = auth.currentUser?.uid || "system";
      const alertTitle = "CRITICAL: Salinity Alert";
      const alertMessage = `Unit ${deviceId} detected critical TDS levels (${tds} PPM). Please inspect the facility immediately.`;

      // 1. In-App Notification (Persistent)
      await createNotification(userId, alertTitle, alertMessage, NOTIFICATION_TYPES.CRITICAL);
    }

    await update(ref(db), updates);
  } catch (error) {
    logger.error("[Reading Service]: Hardware command failed.", error);
    if (error instanceof appError) throw error;
    throw new appError(
      "Device command failed. The sensor node may be offline.",
      true,
      "reading/update-failed"
    );
  }
};

/**
 * Fetches historical logs for a device.
 *
 * @param {string} deviceId - Unique identifier for the device
 * @param {number} limit - Maximum number of logs to retrieve
 * @param {string} date - Optional. Filter logs by date (YYYY-MM-DD)
 * @returns {Promise<Array>} - List of formatted logs
 */
export const getHistoricalLogs = async (deviceId, limit = 50, date = null) => {
  if (!deviceId) {
    throw new appError(
      "Device ID is required to fetch history.",
      true,
      "reading/invalid-parameters"
    );
  }

  // IDOR DEFENSE: Verify access before fetching logs
  await verifyDeviceAccess(deviceId);

  let logsRef;

  if (date) {
    // Ensure we capture the full 24 hours of the selected date in LOCAL time
    const day = new Date(date);
    // Use local time bounds for the query since clientTs uses local machine time (Date.now())
    const startTs = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      0,
      0,
      0,
      0
    ).getTime();
    const endTs = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      23,
      59,
      59,
      999
    ).getTime();

    // Firebase orderByKey() queries always compare strings.
    // We convert timestamps to strings to match the keys written in updateBulbState.
    logsRef = query(
      ref(db, `logs/${deviceId}`),
      orderByKey(),
      startAt(startTs.toString()),
      endAt(endTs.toString())
    );
  } else {
    // Default: Get most recent logs
    logsRef = query(ref(db, `logs/${deviceId}`), orderByKey(), limitToLast(limit));
  }

  try {
    const snapshot = await get(logsRef);
    if (!snapshot.exists()) return [];

    const data = snapshot.val();

    // Transform and normalize historical data
    return Object.entries(data)
      .map(([key, val]) => ({
        id: key,
        ...transformReading(val),
        // Robust timestamp normalization: Prefer server timestamp, fallback to key, then now
        __normalizedTs: val.timestamp || parseInt(key) || Date.now(),
      }))
      .sort((a, b) => b.__normalizedTs - a.__normalizedTs);
  } catch (error) {
    logger.error("[Reading Service]: Logs fetch failure", error);
    throw new appError(
      "The historical data service is currently unavailable.",
      true,
      "reading/logs-fetch-failed"
    );
  }
};

export const subscribeToAllTelemetry = (deviceIds, callback, onError = null) => {
  const telemetryRef = ref(db, "readings");

  return onValue(
    telemetryRef,
    (snapshot) => {
      const readings = snapshot.val() || {};
      const normalizedTelemetry = {};

      // First, initialize all provided device IDs with default standby data
      deviceIds.forEach((id) => {
        normalizedTelemetry[id] = transformReading(null);
      });

      // Then, overwrite with actual 'latest' data if it exists
      Object.keys(readings).forEach((id) => {
        if (readings[id]?.latest) {
          normalizedTelemetry[id] = transformReading(readings[id].latest);
        }
      });

      callback(normalizedTelemetry);
    },
    onError
  );
};

export default {
  subscribeToLatestReading,
  getHistoricalLogs,
  subscribeToAllTelemetry,
};
