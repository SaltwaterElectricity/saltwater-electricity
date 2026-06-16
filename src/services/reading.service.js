import {
  ref,
  onValue,
  get,
  query,
  limitToLast,
  orderByKey,
  orderByChild,
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

  // 1. Admin/SuperAdmin Bypass (Checks both Token Claims and DB Role for redundancy)
  const claims = await getUserClaims(currentUser);
  if (claims?.admin || claims?.superAdmin) return true;

  // DB Role Fallback: Sinisiguro nito na ang Admin ay hindi maba-block kahit hindi pa refresh ang token
  try {
    const roleRef = ref(db, `roles/${currentUser.uid}/role`);
    const roleSnap = await get(roleRef);
    const role = roleSnap.val();
    if (role === "admin" || role === "superAdmin") return true;
  } catch (err) {
    logger.warn("[Security]: Database role check skipped during access verification.", err);
  }

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
export const transformReading = (data, id = "Unknown") => {
  // If no data, return default standby state
  if (!data || typeof data !== "object") {
    return {
      voltage: 0,
      tds: 0,
      current: 0,
      timestamp: Date.now(),
      relay_active: false,
      bulb_ma: 0,
      esp_ma: 0,
      sensor_ma: 0,
      power_mode: "Standby",
      is_maintenance: false,
      device_id: id,
      isFallback: true, // 🛡️ PHANTOM DEFENSE: Mark as local fallback
    };
  }

  const transformed = {
    ...data,
    bulb_ma: data.bulb_ma ?? 0,
    esp_ma: data.esp_ma ?? 0,
    sensor_ma: data.sensor_ma ?? 0,
    power_mode: data.power_mode || "Active",
    is_maintenance: !!data.is_maintenance,
    device_id: data.device_id || id,
    isFallback: false,
  };

  // 1. CALCULATE DERIVED METRICS: Total Current in Amps
  // Priority: 1. total_ma (if exists), 2. Sum of bulb+esp+sensor
  const rawTotalMa = transformed.total_ma;
  const bulb = Number(transformed.bulb_ma);
  const esp = Number(transformed.esp_ma);
  const sensor = Number(transformed.sensor_ma);

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

    // 3. Add to Historical Logs (Nested under readings node)
    updates[`readings/${deviceId}/logs/${clientTs}`] = baseReading;

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

    // CRITICAL ALERT CHECK: Trigger notification if TDS or Voltage hits critical thresholds
    const tds = currentData.tds_ppm || 0;
    const voltage = currentData.voltage || 0;
    const tdsConfig = SENSOR_CONFIG[METRICS.TDS];
    const voltConfig = SENSOR_CONFIG[METRICS.VOLTAGE];
    const userId = auth.currentUser?.uid || "system";

    // 1. High Salinity Check
    if (tds >= tdsConfig.critical) {
      await createNotification(
        userId,
        "CRITICAL: Salinity Alert",
        `Unit ${deviceId} detected critical high TDS levels (${tds} PPM). Please inspect the facility immediately.`,
        NOTIFICATION_TYPES.CRITICAL
      );
    }

    // 2. Electrolyte Weakening (Low Salinity) Check
    if (tds <= tdsConfig.lowCritical) {
      await createNotification(
        userId,
        "CRITICAL: Low Salinity",
        `Unit ${deviceId} detected critically low TDS (${tds} PPM). Minimum ions for electricity generation not met.`,
        NOTIFICATION_TYPES.CRITICAL
      );
    } else if (tds <= tdsConfig.lowWarning) {
      await createNotification(
        userId,
        "WARNING: Electrolyte Weakening",
        `Unit ${deviceId} detected low TDS (${tds} PPM). Saltwater efficiency is decreasing.`,
        NOTIFICATION_TYPES.WARNING
      );
    }

    // 3. Battery/Voltage Check
    if (voltage <= voltConfig.lowCritical) {
      await createNotification(
        userId,
        "CRITICAL: Battery Exhausted",
        `Unit ${deviceId} voltage is critically low (${voltage}V). System may shut down soon.`,
        NOTIFICATION_TYPES.CRITICAL
      );
    } else if (voltage <= voltConfig.lowWarning) {
      await createNotification(
        userId,
        "WARNING: Low Power",
        `Unit ${deviceId} voltage is low (${voltage}V). Check electrolyte levels.`,
        NOTIFICATION_TYPES.WARNING
      );
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
    // 1. DATE BOUNDS: Convert YYYY-MM-DD to absolute millisecond range for the full local day.
    const [y, m, d] = date.split("-").map(Number);
    const startTs = new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
    const endTs = new Date(y, m - 1, d, 23, 59, 59, 999).getTime();

    // 🛡️ SECURITY: Apply a safety limit even for date queries to prevent browser-crashing payloads.
    // 🛡️ RECOVERY: Use orderByChild('timestamp') to support both Push IDs and numeric keys.
    logsRef = query(
      ref(db, `readings/${deviceId}/logs`),
      orderByChild("timestamp"),
      startAt(startTs),
      endAt(endTs),
      limitToLast(Math.max(limit, 500)) // Safety headroom
    );
  } else {
    // Default: Get most recent logs. Using orderByKey() for the 'recent' view is still valid and cheap.
    logsRef = query(ref(db, `readings/${deviceId}/logs`), orderByKey(), limitToLast(limit));
  }

  try {
    const snapshot = await get(logsRef);
    if (!snapshot.exists()) {
      logger.debug(`[Reading Service]: No logs found for ${deviceId} in range.`);
      return [];
    }

    const data = snapshot.val();

    // 2. DATA NORMALIZATION:
    // Some logs might use numeric keys (clientTs), others use Push IDs.
    // We normalize everything to have a numeric __normalizedTs.
    const logs = Object.entries(data).map(([key, val]) => {
      const numericKey = parseInt(key);
      const dbTs = Number(val.timestamp);
      const timestamp = !isNaN(dbTs) ? dbTs : (isNaN(numericKey) ? null : numericKey);

      return {
        id: key,
        ...transformReading(val),
        __normalizedTs: timestamp,
      };
    });

    return logs
      .filter((log) => log.__normalizedTs !== null && !isNaN(log.__normalizedTs))
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
  if (!Array.isArray(deviceIds) || deviceIds.length === 0) {
    // If no IDs, return immediately with empty state
    callback({});
    return () => {};
  }

  const normalizedTelemetry = {};
  const unsubscribes = [];

  // 1. Initialize all IDs with default standby data immediately
  deviceIds.forEach((id) => {
    normalizedTelemetry[id] = transformReading(null);
  });
  callback({ ...normalizedTelemetry });

  // 2. Subscribe to each device node individually (Rule-compliant)
  deviceIds.forEach((id) => {
    const deviceRef = ref(db, `readings/${id}/latest`);
    const unsub = onValue(
      deviceRef,
      (snapshot) => {
        try {
          const data = snapshot.val();
          normalizedTelemetry[id] = transformReading(data);
          // Trigger callback with a shallow copy to ensure state updates in hooks
          callback({ ...normalizedTelemetry });
        } catch (err) {
          logger.warn(`[Telemetry Service] Parse error for device ${id}:`, err);
        }
      },
      (error) => {
        logger.error(`[Telemetry Service] Subscription failed for device ${id}:`, error);
        // On failure, keep the standby data but inform the error handler if it's the first time
        if (onError && Object.keys(normalizedTelemetry).length === 1) {
          onError(error);
        }
      }
    );
    unsubscribes.push(unsub);
  });

  // 3. Return combined cleanup function
  return () => {
    unsubscribes.forEach((un) => un());
  };
};

export default {
  subscribeToLatestReading,
  getHistoricalLogs,
  subscribeToAllTelemetry,
};
