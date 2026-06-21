# Project Codebase Security Audit Report

This report documents the security audit of the `iot-app` codebase against the required quality and security checklist, adapted for your Vercel, React, Firebase RTDB, and ESP32 stack.

---

## 1. Compliance Checklist Status

| Required Checklist Item | Actual Code Status | Compliance | Audit Verification Details |
| :--- | :--- | :--- | :--- |
| **1. Web server firewall (Ports 80/443 only)** | Managed by Vercel Edge | **Compliant** | Infrastructure is serverless. Vercel blocks all non-HTTP/HTTPS ports at its edge network. |
| **2. Server SSH restricted** | Serverless Architecture | **Compliant** | No virtual machines or operating system listeners are exposed. Access is gated by Vercel Dashboard IAM permissions. |
| **3. CSRF Protection (stateless POST routes)** | JWT / Auth Headers | **Partially Compliant** | Client requests use Bearer JWTs, avoiding session cookies. However, **`api/sendProvisioningEmail.js` has no authentication check**, meaning anyone can execute POST requests. |
| **4. Disable directory listing** | Vite + Vercel Edge Router | **Compliant** | Vercel's routing does not allow folder traversal. Source maps are also blocked/removed from client production builds. |
| **5. Keep dependencies updated** | React 19 / Vite 7 / ESLint | **Compliant** | Modern dependencies are used. Git hooks (`Husky` + `lint-staged`) and security plugins (`eslint-plugin-security`) validate code quality. |
| **6. Web Application Firewall (WAF)** | Vercel Edge Shield | **Compliant** | Vercel Edge provides built-in Layer 3/4 and Layer 7 DDoS mitigation. |
| **7. Error message sanitization** | SUEP / custom error responses | **Compliant** | `sendError` in `api/_utils/response.js` intercepts status 500 errors, logs actual stack traces privately, and returns sanitized messages to clients. |
| **8. Strict Firebase Security Rules** | database.rules.json | **Partially Compliant** | Rules correctly restrict `/readings`, `/users`, and `/audit-logs`. However, **`/login-attempts` has public read/write permission** (`.read: true`, `.write: true`). |
| **9. ESP32 dedicated credentials** | api/triggerHardwareAlert.js | **Non-Compliant** | **VULNERABILITY:** Devices authenticate using a single global shared secret `HARDWARE_SECRET_KEY` from environment variables. |
| **10. App deployed over HTTPS** | Vercel Edge Certificates | **Compliant** | Vercel forces Let's Encrypt SSL/TLS certificates and auto-redirects all HTTP traffic to HTTPS. |
| **11. Firebase App Check enabled** | src/firebaseConfig.js | **Non-Compliant** | **Firebase App Check is missing entirely** from client and config files. |
| **12. Automated daily RTDB backups** | Firebase Console Settings | **Policy/Setup Gap** | Requires manual configuration of daily JSON exports to GCS in the Firebase Console (Blaze Plan). |
| **13. Backups in separate region/bucket** | Google Cloud Storage Bucket | **Policy/Setup Gap** | Requires provisioning a secondary GCS bucket in a separate region/project and mapping Firebase automated exports to it. |
| **14. Vercel source code in private Git repo** | Workspace Git repository | **Compliant** | Verification confirmed. All codebase and Vercel configs are hosted in a secure, private, version-controlled repository. |
| **15. Restoration testing once per semester** | Operational SOP | **Policy/SLA Gap** | Staging restoration validation procedures must be drafted and scheduled semiannually. |
| **16. Recovery Time Objective (RTO) < 8h** | SLA Commitment | **Policy/SLA Gap** | Recovery playbook must be established to restore components within the 8-hour window. |
| **17. Recovery Point Objective (RPO) < 24h** | SLA Commitment | **Policy/SLA Gap** | RPO is met in policy via the daily (24-hour) automated backup cycle. |
| **18. Access-controlled, non-public backups** | GCS Bucket IAM / Uniform ACL | **Policy/Setup Gap** | GCP storage buckets must be configured to enforce Uniform Access Control and enable "Block all public access". |

---

## 2. Detailed Vulnerability & Policy Findings

### 🚨 Finding 1: Shared Global Secret Key for ESP32 Authentication
*   **Severity**: Critical (High Likelihood, High Impact)
*   **Location**: [api/triggerHardwareAlert.js#L25-L36](file:///C:/Users/Admin/testcode/api/triggerHardwareAlert.js#L25-L36)
*   **Risk**: The API endpoint authenticates incoming alerts by matching the payload's `secretKey` to `process.env.HARDWARE_SECRET_KEY`. This means all ESP32 devices deployed in the field share the exact same credential. If a single ESP32 controller is decompiled, physical security is breached, or code is leaked, the shared credential is compromised. Attackers could spoof alerts, trigger spam SMS notifications, or abuse SMS gateways.
*   **Remediation**: Transition to a dynamic device token system. Store cryptographically unique device tokens in `/device_information/{deviceId}/token` (managed by database rules) and verify the token dynamically inside `triggerHardwareAlert.js`.

### 🚨 Finding 2: Unauthenticated Email Gateway API
*   **Severity**: High (High Likelihood, Medium Impact)
*   **Location**: [api/sendProvisioningEmail.js](file:///C:/Users/Admin/testcode/api/sendProvisioningEmail.js)
*   **Risk**: The API route `api/sendProvisioningEmail.js` receives email requests, formats them, and calls the SendGrid REST API. However, **this route has zero authentication checks**. Anyone can construct a POST request to this endpoint with a customized payload and send spam or phishing emails, exhausting SendGrid API quotas.
*   **Remediation**: Restrict this API to administrators only. Read the `Authorization: Bearer <ID_TOKEN>` header, verify the token via the `firebase-admin` authentication SDK, and check that the user role is `admin` or `superAdmin` before triggering emails.

### ⚠️ Finding 3: Public Read/Write on `/login-attempts` database node
*   **Severity**: Medium (High Likelihood, Low Impact)
*   **Location**: [database.rules.json#L108-L117](file:///C:/Users/Admin/testcode/database.rules.json#L108-L117)
*   **Risk**: The `login-attempts` database rules have `.read: true` and `.write: true`. Although there is validation logic, this public accessibility opens the system to database structure discovery, data extraction, or arbitrary writes. Attackers can spam writes to any tracking ID to lock out legitimate users before they even attempt to authenticate.
*   **Remediation**: Migrate authentication tracking and lockouts away from client-side RTDB writes. Move lockout monitoring to serverless authentication endpoints or utilize Firebase Auth's native protection controls.

### ⚠️ Finding 4: Missing OTP Brute-Force Rate Limiting
*   **Severity**: High (Medium Likelihood, High Impact)
*   **Location**: [api/verifyOTP.js](file:///C:/Users/Admin/testcode/api/verifyOTP.js)
*   **Risk**: The `verifyOTP` API checks if the user-provided code matches the code in the database. If it does not match, it returns an error but **does not decrement an attempt counter or track failed tries**. Because the OTP code is a 6-digit number, an attacker can brute-force the code (1 million combinations) in seconds using high-concurrency requests, compromising user accounts during password recovery.
*   **Remediation**: In `otp-requests/{trackingId}`, store an `attempts` counter. When verification fails, increment `attempts`. If `attempts` reaches 3, delete the OTP record from the database and reject subsequent attempts.

### ⚠️ Finding 5: Firebase App Check is Missing
*   **Severity**: Medium (Low Likelihood, Medium Impact)
*   **Location**: [src/firebaseConfig.js](file:///C:/Users/Admin/testcode/src/firebaseConfig.js)
*   **Risk**: Without App Check, your Firebase Realtime Database is accessible from any client (e.g., Postman, scripts, custom applications) using the Firebase configuration keys (which are public in the JavaScript build files). This allows attackers to bypass your frontend routing entirely and query or write to your database paths (within security rule constraints).
*   **Remediation**: Initialize Firebase App Check in `firebaseConfig.js` using ReCAPTCHA Enterprise or Play Integrity providers.

### ⚠️ Finding 6: Lack of Automated Disaster Recovery Procedures & SLA Policies
*   **Severity**: Medium (Low Likelihood, Medium Impact)
*   **Location**: Infrastructure Configuration / Operations
*   **Risk**: Automated daily RTDB backups to an isolated Google Cloud Storage (GCS) bucket, restoration test dry-runs, and RTO/RPO SLA definitions are not formally integrated or verified. In the event of data corruption, region-wide cloud outage, or console account breach, the system risks permanent telemetry loss, prolonged dashboard downtime, or unauthorized access to backup files.
*   **Remediation**: 
    1.  Upgrade the Firebase Project to the Blaze Plan and enable Automated Backups, selecting a secondary GCS bucket in a separate region.
    2.  Apply bucket permissions ensuring "Block All Public Access" and "Uniform bucket-level access" are active.
    3.  Add semiannual restore tests to operational schedules.

---

## 3. Actionable Remediation Code Examples

### A. Securing the Email Gateway Endpoint (`api/sendProvisioningEmail.js`)
Update the handler to verify the Firebase ID Token and check for Administrative privileges:

```javascript
import { initFirebaseAdmin } from "./_utils/firebase.js";
import { sendSuccess, sendError, handleOptions } from "./_utils/response.js";
import sgMail from "@sendgrid/mail";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (req.method !== "POST") {
    return sendError(res, "Method Not Allowed", 405, "mail/method-not-allowed");
  }

  // Verify Admin Permissions
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "Authentication required", 401, "mail/unauthorized");
  }

  const token = authHeader.split(" ")[1];
  try {
    const { auth, db } = initFirebaseAdmin();
    const decodedToken = await auth.verifyIdToken(token);
    
    // Check role from DB
    const roleSnap = await db.ref(`roles/${decodedToken.uid}`).get();
    const userRole = roleSnap.exists() ? roleSnap.val().role : null;

    if (userRole !== "admin" && userRole !== "superAdmin") {
      return sendError(res, "Forbidden", 403, "mail/forbidden");
    }

    // Provisioning email execution logic here...
  } catch (err) {
    return sendError(res, "Invalid session token", 401, "mail/invalid-token");
  }
}
```

### B. Adding Brute-Force Protection to OTP Verification (`api/verifyOTP.js`)
Limit failed attempts to a maximum of 3 before destroying the OTP request:

```javascript
// ... existing checks ...
const data = snapshot.val();
const attempts = data.attempts || 0;

if (attempts >= 3) {
  await otpRef.remove();
  return sendError(res, "Too many failed verification attempts. Please request a new code.", 400, "otp/too-many-attempts");
}

const isMatch = data.code === code.toString().trim();

if (!isMatch) {
  await otpRef.update({ attempts: attempts + 1 });
  return sendError(res, `Invalid security code. ${2 - attempts} attempts remaining.`, 400, "otp/invalid-code");
}
```

### C. Integrating Firebase App Check (`src/firebaseConfig.js`)
Initialize App Check to validate client verification:

```javascript
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
// ... config initialization ...

const app = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG);

// App Check initialization
if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider("YOUR_RECAPTCHA_ENTERPRISE_KEY"),
    isTokenAutoRefreshEnabled: true,
  });
}
```
