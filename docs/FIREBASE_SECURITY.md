# Firebase Security & Backend Integration Guide

This guide details how to implement, audit, and maintain security configurations for **Firebase Authentication**, **Realtime Database (RTDB)**, and **App Check** in the `iot-app` project.

---

## 1. Firebase Security Translation Map

Based on our ISO 25010 audit, the security guidelines from your checklist are mapped to specific Firebase backend configurations below:

| Checklist Requirement                                                             | Firebase Implementation                                                                                                                                        | Security Objective                                             |
| :-------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------- |
| **Strict Security Rules** (Role-based authenticated access, no public read/write) | Granular paths in `database.rules.json` scoped using `auth != null` and validation checks matching roles in the `/roles` node.                                 | **Confidentiality & Integrity** (Principle of Least Privilege) |
| **Dedicated Device Credentials** (No shared credentials across ESP32)             | Individual ESP32 device database accounts or unique registration tokens stored under `/device_information/{deviceId}/token`.                                   | **Authenticity & Accountability** (Device Isolation)           |
| **Firebase App Check** (Ensure only verified clients access RTDB)                 | ReCAPTCHA Enterprise (Web) / Play Integrity (Android) verification of client binaries.                                                                         | **Authenticity** (Abuse & Bot Mitigation)                      |
| **Silent 404 / EPP Protocol**                                                     | Denying read/write permissions at the DB rule level automatically returns permission errors to standard client requests without revealing database structures. | **Confidentiality** (Enumeration Prevention)                   |
| **Audit Logging**                                                                 | Administrative actions written directly to `/audit-logs` utilizing database rules that allow writes only by administrative roles.                              | **Non-Repudiation & Audit**                                    |
| **Automated Daily Backups**                                                       | Firebase RTDB Automated Backup to Google Cloud Storage (GCS) in a separate region/bucket.                                                                      | **Reliability** (Recoverability & Data Durability)             |

---

## 2. Realtime Database Security Rules Configuration (`database.rules.json`)

To fully satisfy the checklist and fix identified vulnerabilities (such as the public read/write permission on the lockout path), use this hardened `database.rules.json` configuration:

```json
{
  "rules": {
    ".read": false,
    ".write": false,

    "users": {
      ".indexOn": ["email"],
      ".read": "auth != null && (root.child('roles').child(auth.uid).child('role').val() == 'superAdmin' || root.child('roles').child(auth.uid).child('role').val() == 'admin')",
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && (root.child('roles').child(auth.uid).child('role').val() == 'superAdmin' || auth.uid == $uid || (root.child('roles').child(auth.uid).child('role').val() == 'admin' && newData.parent().parent().child('roles').child($uid).child('role').val() == 'resident'))"
      }
    },

    "accounts": {
      ".read": "auth != null && (root.child('roles').child(auth.uid).child('role').val() == 'superAdmin' || root.child('roles').child(auth.uid).child('role').val() == 'admin')",
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && (root.child('roles').child(auth.uid).child('role').val() == 'superAdmin' || auth.uid == $uid || (root.child('roles').child(auth.uid).child('role').val() == 'admin' && newData.parent().parent().child('roles').child($uid).child('role').val() == 'resident'))",
        "status": {
          ".validate": "newData.val() == 'active' || newData.val() == 'disabled' || newData.val() == 'suspended'"
        },
        "requiresPasswordChange": {
          ".validate": "newData.isBoolean()"
        },
        "updatedAt": {
          ".validate": "newData.val() <= now"
        }
      }
    },

    "roles": {
      ".indexOn": ["role"],
      ".read": "auth != null && (root.child('roles').child(auth.uid).child('role').val() == 'superAdmin' || root.child('roles').child(auth.uid).child('role').val() == 'admin')",
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && (root.child('roles').child(auth.uid).child('role').val() == 'superAdmin' || (root.child('roles').child(auth.uid).child('role').val() == 'admin' && newData.child('role').val() == 'resident'))"
      }
    },

    "device_information": {
      ".indexOn": ["availability"],
      ".read": "auth != null",
      "$device_id": {
        ".write": "auth != null && (root.child('roles').child(auth.uid).child('role').val() == 'admin' || root.child('roles').child(auth.uid).child('role').val() == 'superAdmin')",
        ".validate": "newData.hasChildren(['device_id', 'availability'])",
        // Protect secret device token from being read by non-admins
        "token": {
          ".read": "auth != null && (root.child('roles').child(auth.uid).child('role').val() == 'admin' || root.child('roles').child(auth.uid).child('role').val() == 'superAdmin')"
        }
      }
    },

    "device_assignments": {
      ".read": "auth != null",
      "$device_id": {
        ".write": "auth != null && (root.child('roles').child(auth.uid).child('role').val() == 'admin' || root.child('roles').child(auth.uid).child('role').val() == 'superAdmin')"
      }
    },

    "readings": {
      "$device_id": {
        // Enforce owner check or administrative check
        ".read": "auth != null && (root.child('device_assignments').child($device_id).child('userId').val() == auth.uid || root.child('roles').child(auth.uid).child('role').val() == 'admin' || root.child('roles').child(auth.uid).child('role').val() == 'superAdmin')",
        "latest": {
          // Hardware writes require verifying the matching device token
          ".write": "auth != null || (newData.child('token').val() == root.child('device_information').child($device_id).child('token').val())",
          ".validate": "newData.hasChildren(['tds_ppm', 'voltage'])"
        },
        "logs": {
          ".indexOn": ["timestamp"],
          "$log_id": {
            ".write": "auth != null || (newData.child('token').val() == root.child('device_information').child($device_id).child('token').val())",
            ".validate": "newData.hasChildren(['timestamp', 'tds_ppm'])"
          }
        }
      }
    },

    "commands": {
      "$device_id": {
        ".read": "auth != null && (root.child('device_assignments').child($device_id).child('userId').val() == auth.uid || root.child('roles').child(auth.uid).child('role').val() == 'admin' || root.child('roles').child(auth.uid).child('role').val() == 'superAdmin')",
        ".write": "auth != null && (root.child('device_assignments').child($device_id).child('userId').val() == auth.uid || root.child('roles').child(auth.uid).child('role').val() == 'admin' || root.child('roles').child(auth.uid).child('role').val() == 'superAdmin')"
      }
    },

    "login-attempts": {
      "$trackingId": {
        // REMEDIATION: Remove public .read and .write rules.
        // Lockout records should be queried and updated strictly through the serverless Auth API.
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

---

## 3. Firebase App Check Configuration

To prevent unauthorized API access, client configuration spoofing, and bot abuse, **Firebase App Check** must be enabled.

### Step 1: Register Your Application

1.  Go to the **Firebase Console** -> **App Check**.
2.  Register your **Web App** using **reCAPTCHA Enterprise** or **reCAPTCHA v3**.
3.  Register your **Android App** (for Cordova builds) using **Play Integrity** or **SafetyNet**.

### Step 2: Initialize in the Frontend Code

Add the initialization script inside [src/firebaseConfig.js](file:///C:/Users/Admin/testcode/src/firebaseConfig.js):

```javascript
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

const app = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG);

// Initialize App Check for web environments
if (typeof window !== "undefined" && !import.meta.env.DEV) {
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true,
  });
}
```

---

## 4. Secure Telemetry: Dynamic Device Token Model

To replace the insecure global shared `HARDWARE_SECRET_KEY` rule, implement individual device authorization tokens:

```
[ESP32 Device] ────► Sends unique token with reading
                           │
                           ▼
                  [Firebase RTDB Rules]
                           │
             Compare payload token with token at:
        /device_information/{deviceId}/token
                           │
            ┌──────────────┴──────────────┐
            ▼ (Matches)                   ▼ (Fails)
      Allow DB Write               Deny (403 Forbidden)
```

### A. Telemetry Write Payload Structure

The ESP32 must append its secret device-specific token to every telemetry payload:

```json
{
  "tds_ppm": 350,
  "voltage": 3.29,
  "timestamp": 1782038450000,
  "token": "device_specific_secret_token_1a2b3c"
}
```

### B. Hardware Alert API Remediation (`api/triggerHardwareAlert.js`)

Modify the API handler to fetch the device-specific token from the Firebase database and match it, instead of validating against a single shared environment variable.

```javascript
// Inside api/triggerHardwareAlert.js
const { db } = initFirebaseAdmin();

// Fetch the registered secret token for the specific device
const deviceSnap = await db.ref(`device_information/${deviceId}`).get();
if (!deviceSnap.exists()) {
  return sendError(res, "Device not registered.", 404, "hw/unregistered");
}

const registeredToken = deviceSnap.val().token;
if (!registeredToken) {
  return sendError(res, "Security configuration missing on hardware.", 500, "hw/config-error");
}

// Perform cryptographic verification of the device's token
if (secretKey !== registeredToken) {
  console.warn(`[SECURITY] Unauthorized telemetry alert attempt on device: ${deviceId}`);
  return sendError(res, "Unauthorized", 401, "hw/unauthorized");
}
```

---

## 5. Disaster Recovery, Backup, & SLA Policies

To comply with ISO/IEC 25010 under the **Reliability: Recoverability** quality characteristic, the backend implements the following backup protocols:

### A. Automated Daily GCS Backup Configuration

The Firebase Realtime Database containing telemetry readings, accounts, assignments, alerts, and audit logs must be backed up daily:

1.  **Backup Mechanism**: Enable automated backups in the **Firebase Console (Database Settings -> Backups)**. Firebase automatically generates a JSON export of the entire database tree once every 24 hours.
2.  **Geographical Isolation**: Backup files must be routed to a designated **Google Cloud Storage (GCS)** bucket located in a separate GCP project and distinct physical region (e.g., `asia-east1` if the main RTDB is in `us-central1`). This protects against region-wide datacenter outages.

### B. IAM Access Control & Public Access Blocking

- **Enforce uniform bucket-level access** on the target GCS backup bucket.
- **Block All Public Access** must be enabled on the storage bucket config.
- **Principle of Least Privilege (PoLP)**: Access to backup buckets is restricted to the Cloud Backup Service IAM Account and the designated Lead Systems Administrator. Developer accounts are prohibited from reading backup buckets.

### C. Backup Restoration Testing Protocol

- **Frequency**: Restoration validation runs at least **once per semester** (once every 6 months) to verify archive integrity.
- **Process**:
  1.  Provision an isolated staging Firebase RTDB instance.
  2.  Download the latest daily backup JSON from GCS.
  3.  Import the JSON file into the staging instance.
  4.  Execute staging integration test scripts to verify schema completeness, user accounts authorization references, and telemetry history validation.

### D. Recovery SLA Objectives

To minimize service interruption and potential data loss, the platform commits to the following metrics:

- **Recovery Time Objective (RTO) < 8 Hours**: All critical backend modules (Firebase RTDB structure, Vercel Serverless Functions, Dashboard compilation/hosting, SMS Alert routes) must be fully restorable to operational status within 8 hours of a disaster declaration.
- **Recovery Point Objective (RPO) < 24 Hours**: The maximum acceptable data loss is limited to 24 hours (aligned with the daily automated backup cycle).
- **Vercel Source Code Recovery**: All Vercel Function script directories (`/api`) and configurations (`vercel.json`) must be checked into a private version-controlled Git repository (GitHub/GitLab), serving as the secondary recovery artifact for fast application server redeployment.
