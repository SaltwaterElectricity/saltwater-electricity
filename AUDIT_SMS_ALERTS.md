# Audit: SMS Alert System for Salinity Monitoring

## 1. Objective

To evaluate and recommend a strategy for implementing real-time SMS alerts when TDS/PPM (Salinity) levels hit warning or critical thresholds.

---

## 2. Current Infrastructure Analysis

- **Telemetry:** ESP32 sends real-time data to Firebase RTDB (`/readings/{deviceId}/latest`).
- **Thresholds:** Centralized in `src/constants/index.js`.
  - **Warning:** 300 PPM
  - **Critical:** 500 PPM
- **User Data:** Profiles already contain a `mobileNum` field in `/users/{uid}`.
- **Notification System:** In-app notifications are handled via `notification.service.js`.
- **Existing External Services:** Email is handled via SendGrid through a Vercel Serverless Function (`/api/sendProvisioningEmail`).

---

## 3. Comparative Analysis: Provider vs. DIY

| Feature         | SMS Provider (Twilio/Vonage)                           | DIY (GSM Module + ESP32)                                          |
| :-------------- | :----------------------------------------------------- | :---------------------------------------------------------------- |
| **Reliability** | **High:** Uses carrier-grade gateways.                 | **Low:** Dependent on local signal, SIM load, and hardware power. |
| **Security**    | **High:** API keys are stored in backend environments. | **Low:** Credentials/SIM card physically accessible on device.    |
| **Maintenance** | **Low:** Managed service with API documentation.       | **High:** Hardware failures, antenna issues, SIM card expiration. |
| **Cost**        | Small fee per SMS + monthly number fee.                | Cost of SIM card + local prepaid load.                            |
| **Scalability** | Can send thousands of alerts simultaneously.           | Limited to one SMS at a time per hardware unit.                   |

### **Recommendation: Use a Centralized Private SMS Gateway (Android)**

For a system monitoring critical parameters like water salinity, **cost-efficiency and offline reliability** are prioritized. The system now uses a **Centralized Private SMS Gateway** model:

- **Zero Cost:** Uses local prepaid load or unlimited SMS plans from a native SIM card.
- **Independence:** No reliance on third-party APIs (PhilSMS/Twilio).
- **Control:** All alerts are routed through a single master device managed by the administrator.

A DIY GSM module was considered but rejected in favor of an Android-based gateway (running this app via Cordova) which provides better signal handling and simpler maintenance.

---

## 4. Proposed Architecture (Centralized Private Gateway)

1.  **Hardware (ESP32):** Pushes data to Firebase. Calls the `triggerHardwareAlert` API for immediate delivery.
2.  **Backend Logic (Vercel):** `api/triggerHardwareAlert.js` processes the alert and identifies the owner's mobile number.
3.  **Queueing:** Instead of calling a provider, the backend pushes a message to the `sms_queue` in Firebase, assigned to a hardcoded `MASTER_GATEWAY_UID`.
4.  **Dispatch:** The designated Android device (the Master Gateway) listens to the queue and sends the SMS via its SIM card.

---

## 5. Implementation Roadmap

### Phase 1: Gateway Setup (Completed)

- Decommissioned PhilSMS integration.
- Configured `MASTER_GATEWAY_UID` in environment variables.
- Updated `triggerHardwareAlert` to route all alerts to the master gateway.

### Phase 2: Native Integration (Completed)

- Implemented `src/services/smsGateway.service.js` for Cordova-based SMS dispatch.
- Integrated background mode to ensure 24/7 uptime on the Android device.

### Phase 4: UI Updates

- Add an "SMS Alerts" toggle in the User Profile/Settings.
- Ensure the `mobileNum` field is validated (e.g., `639...`).

---

## 6. Audit Conclusion

The transition to a **Centralized Private SMS Gateway** is the optimal choice for this project. It eliminates recurring costs, ensures that critical alerts are delivered even when third-party provider balances are low, and leverages the native capabilities of the Android ecosystem. By routing all system alerts through a single, administrator-controlled device, we maintain maximum security and operational transparency.
