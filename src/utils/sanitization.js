/**
 * Utility for sanitizing strings for use as Firebase Database keys.
 * Specifically used for tracking login attempts and other non-email-stored IDs.
 */
export const sanitizeForFirebaseKey = (str) => {
  if (!str) return "";
  // 1. Convert to lowercase and trim
  // 2. Remove all characters that are invalid in Firebase keys: . $ # [ ] /
  // 3. We use a more restrictive alphanumeric filter to prevent path traversal/injection.
  return str.toLowerCase().trim().replace(/[^a-zA-Z0-9]/g, '');
};
