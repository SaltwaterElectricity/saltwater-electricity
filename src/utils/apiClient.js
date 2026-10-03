/**
 * API Client Utility
 * Resolves relative API endpoints to absolute URLs based on VITE_API_BASE_URL.
 *
 * Behavior:
 * - VITE_API_BASE_URL unset/empty -> Returns relative path (Vercel/Local same-origin)
 * - VITE_API_BASE_URL set -> Returns absolute URL (Render separate-origin)
 */
export const getApiUrl = (endpoint) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';

  if (!baseUrl) {
    // Ensure endpoint starts with / for consistency in same-origin requests
    return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  }

  // Normalize baseUrl: remove trailing slash
  const normalizedBase = baseUrl.replace(/\/$/, '');

  // Normalize endpoint: ensure it starts with /api/
  let normalizedPath = endpoint;
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = `/${normalizedPath}`;
  }

  // prevent double slashes if baseUrl ends in / or path starts with /
  return `${normalizedBase}${normalizedPath}`;
};
