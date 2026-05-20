/**
 * timeUtils.js
 * Helpers for time-sensitive calculations and formatting.
 */

const CANCELLATION_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 Hours

/**
 * Calculates remaining time for a cancellation window.
 * @param {number|string} createdAt - Timestamp of creation
 * @returns {number} - Remaining milliseconds (0 if expired)
 */
export const getRemainingCancellationTime = (createdAt) => {
  if (!createdAt) return 0;
  const createdTs = new Date(createdAt).getTime();
  const elapsed = Date.now() - createdTs;
  return Math.max(0, CANCELLATION_WINDOW_MS - elapsed);
};

/**
 * Formats milliseconds into HH:mm:ss string.
 * @param {number} ms - Milliseconds
 * @returns {string} - Formatted time
 */
export const formatCountdown = (ms) => {
  if (ms <= 0) return "00:00:00";

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((v) => v.toString().padStart(2, "0"))
    .join(":");
};

/**
 * Checks if the cancellation window is still active.
 * @param {number|string} createdAt - Timestamp of creation
 * @returns {boolean}
 */
export const isCancellationActive = (createdAt) => {
  return getRemainingCancellationTime(createdAt) > 0;
};
