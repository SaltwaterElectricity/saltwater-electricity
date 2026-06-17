# Private Android SMS Gateway Guide

Your application is now equipped with a **Private SMS Gateway** system. This allows your Android device to handle SMS alerts using its native SIM card, bypassing the need for third-party paid services like PhilSMS.

## 🏗️ Architectural Overview

1.  **Trigger:** Hardware (ESP32) detects an anomaly and calls `triggerHardwareAlert`.
2.  **Queue:** The backend pushes a "pending" SMS request into the `sms_queue` in Firebase, assigned to your specific `uid`.
3.  **Listener:** Your Android App (running this project via Cordova) detects the pending message.
4.  **Native Dispatch:** The app uses the `cordova-sms-plugin` to send the text message directly from your SIM card.
5.  **Acknowledge:** The app updates the queue item status to `sent`.

---

## 🛠️ Required Setup (Android Device Only)

To activate this feature, you must install the following plugins in your Cordova project folder:

```bash
# 1. Native SMS Sending Plugin
cordova plugin add cordova-sms-plugin

# 2. Background Mode Plugin (Required to send SMS while screen is off)
cordova plugin add cordova-plugin-background-mode

# 3. Add Android Platform (If not already added)
cordova platform add android
```

---

## ⚙️ Android System Configuration

To ensure the app isn't "killed" by Android's battery saver, follow these steps on your device:

1.  **Battery Optimization:** Go to _Settings > Apps > Saltwater Electricity > Battery_ and select **"Unrestricted"** or **"Don't Optimize."**
2.  **Permissions:** Ensure the app has the **SMS Permission** allowed.
3.  **Background Mode:** The app will automatically request background execution, but ensuring it's "Pinned" or "Locked" in your Recents menu is recommended for 100% uptime.

---

## 📝 Implementation Details

- **Service:** `src/services/smsGateway.service.js` (Handles Firebase listener + Plugin interface)
- **Hook:** `src/hooks/useSmsGateway.js` (Root-level initialization)
- **Backend:** `api/triggerHardwareAlert.js` (Now pushes to `sms_queue` instead of PhilSMS)

## 🛡️ Security Note

The `sms_queue` is protected by a `gatewayUid`. Your device will **ONLY** process and send SMS messages that are explicitly assigned to your User ID in the database.
