# Vercel Security Implementation Guide

This guide details how to translate legacy, server-based security configurations (such as port firewalls, SSH, and Nginx/Apache directives) into modern **Vercel Serverless Security** protocols for the `iot-app` deployment.

---

## 1. Security Protocol Translation Map

| Legacy Server Requirement                             | Vercel Serverless Security Equivalent                                                                                                                                                                                                                           |
| :---------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Port Firewall** (Close all except 80 & 443)         | **Managed by default**. Vercel runs a serverless edge network. There are no exposed virtual machines, ports, or running operating system listeners that attackers can scan or access.                                                                           |
| **Server SSH Access** (Restricted IPs, port change)   | **Eliminated / IAM Scoped**. Serverless deployments have no SSH access. Security boundaries shift to **Vercel Team IAM Access Control**, Personal Access Tokens (PATs), and mandatory Multi-Factor Authentication (MFA) in the Vercel Console.                  |
| **CSRF Protection** (POST routes)                     | **Stateless Token Verification**. React SPA requests to Vercel Serverless Functions (`/api/*`) do not use stateful cookies. Instead, endpoints validate the cryptographically signed Firebase ID token (`Authorization: Bearer <token>`) passed in the headers. |
| **Directory Listing Disabled**                        | **Handled automatically by the Edge Router**. Vercel's routing infrastructure serves exact path resolutions. Attempting to traverse or index directories returns a `404` or `403` by default.                                                                   |
| **Web Application Firewall (WAF)**                    | **Vercel Web Application Firewall (WAF)**. Enabled automatically at the Edge. It provides L3/L4/L7 DDoS mitigation, OWASP Top 10 rule inspections, and custom request blocking rules managed via the Vercel Dashboard.                                          |
| **Enforced HTTPS Redirects**                          | **Automatic Edge Redirects**. Vercel automatically creates and renews SSL certificates (via Let's Encrypt) and redirects all unencrypted HTTP requests to HTTPS at the Edge before they reach the application.                                                  |
| **Server Error Sanitization** (Suppress stack traces) | **Serverless SUEP implementation**. Catch blocks in `/api/*.js` functions must sanitize database exceptions, log them to backend monitoring, and return generic error bodies with safe message templates to the client.                                         |

---

## 2. Recommended Vercel Security Configuration (`vercel.json`)

To lock down the client-side SPA and serverless backend, we inject secure HTTP headers and configure API route controls inside the [vercel.json](file:///C:/Users/Admin/testcode/vercel.json) file.

```json
{
  "version": 2,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(), microphone=(), camera=(), interest-cohort=()"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com; connect-src 'self' https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://*.firebaseapp.com;"
        }
      ]
    }
  ],
  "functions": {
    "api/*.js": {
      "maxDuration": 10
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

### Explanations of Secure Headers:

1.  **X-Content-Type-Options: `nosniff`**: Prevents the browser from MIME-sniffing a response away from the declared content-type, defending against stylesheet/script uploads.
2.  **X-Frame-Options: `DENY`**: Blocks clickjacking attacks by preventing other sites from embedding the dashboard in an `<iframe\>`.
3.  **X-XSS-Protection: `1; mode=block`**: Re-enables legacy browser filters to block page loading if a cross-site scripting attack is detected.
4.  **Content-Security-Policy (CSP)**:
    - `default-src 'self'`: Restricts all default asset loading to our origin.
    - `connect-src`: Permits network requests only to our origin and Firebase API/RTDB endpoints.
    - `style-src` / `font-src`: Safelists Google Fonts style endpoints and static servers.

---

## 3. Serverless API Security Principles (`/api/*`)

For Vercel Serverless Functions, security must be handled directly inside the JavaScript handler.

### A. HTTP Method Restrictions

Serverless functions should reject unsupported HTTP methods immediately:

```javascript
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  // Operations...
}
```

### B. Firebase ID Token Verification

Since serverless APIs are stateless, client-side requests must prove authentication by attaching the Firebase ID token in the authorization header.

1.  Extract the bearer token in the API function.
2.  Use the `firebase-admin` SDK (`admin.auth().verifyIdToken(token)`) to extract the user's role and identity.
3.  Reject the request if the token is missing or invalid.

```javascript
import admin from "firebase-admin";

// Initialize Admin SDK once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)),
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  });
}

export async function verifyUserRole(req, res, requiredRole) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication token required" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userRole = decodedToken.role || "USER";

    if (requiredRole && userRole !== requiredRole) {
      return res.status(403).json({ error: "Unauthorized role" });
    }
    return decodedToken;
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired authentication session" });
  }
}
```

### C. Backend Error Sanitization (SUEP Protocol)

Never catch database errors and return the raw message or database tables in the HTTP response.

- **Correct (Sanitized)**:

  ```javascript
  try {
    await writeToDatabase(data);
    return res.status(200).json({ success: true });
  } catch (err) {
    // Log the actual error securely to logging platform
    console.error("DB_WRITE_FAILURE:", err);

    // Return a friendly, anonymous message to the client
    return res.status(500).json({
      error: "The telemetry records could not be updated at this time. Please try again.",
    });
  }
  ```

---

## 4. Key Management & Environment Variables

- **Zero Hardcoding**: All secrets (`VITE_SENDGRID_API_KEY`, Firebase Private Keys) must be configured in the **Vercel Dashboard Settings -> Environment Variables**.
- **Build-time vs Runtime Secrets**: Keys starting with `VITE_` are baked into the static React client bundle at build-time. Secure backend keys (like SendGrid keys or Firebase private credentials) **must not** start with `VITE_` to ensure they are never exposed in client JS files, and should be accessed only inside `/api/*` serverless files at runtime.
