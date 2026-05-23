/**
 * Standardized API Response and Error Handling Utility (SUEP Protocol)
 */

export const corsHeaders = {
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Origin": "*", // Consider restricting this to your production domain
  "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
  "Access-Control-Allow-Headers":
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
};

/**
 * Sends a successful JSON response with CORS headers.
 */
export function sendSuccess(res, data = {}, status = 200) {
  Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
  return res.status(status).json({ success: true, ...data });
}

/**
 * Sends an error response with CORS headers, following the SUEP protocol.
 * Masks internal errors in production.
 */
export function sendError(res, error, status = 500, code = "internal-error") {
  Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));

  const isDev = process.env.NODE_ENV === "development";
  const message = typeof error === "string" ? error : error.message;

  console.error(`[API Error] Status: ${status}, Code: ${code}, Message: ${message}`);

  // Mask specific internal errors for security (SUEP)
  let sanitizedMessage = "An unexpected error occurred. Please try again later.";
  
  if (status < 500 || isDev) {
    sanitizedMessage = message;
  }

  return res.status(status).json({
    success: false,
    error: sanitizedMessage,
    code: code,
    details: isDev ? error.stack || message : undefined,
  });
}

/**
 * Handles CORS preflight requests.
 */
export function handleOptions(req, res) {
  if (req.method === "OPTIONS") {
    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
    res.status(200).end();
    return true;
  }
  return false;
}
