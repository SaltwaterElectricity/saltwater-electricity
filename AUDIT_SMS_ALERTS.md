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

### **Recommendation: Use an SMS Provider (PhilSMS)**

For a system monitoring critical parameters like water salinity, **reliability and local accessibility are top priorities**. **PhilSMS (philsms.com)** is recommended as it provides:
- **GCash Payment Support:** Seamless top-ups via the Philippines' most popular mobile wallet.
- **Local Pricing:** Competitive rates (approx. ₱0.35 per SMS).
- **Ease of Use:** Simple REST API that integrates perfectly with our Vercel Serverless environment.

A DIY GSM module adds multiple hardware failure points and increases the power consumption of the IoT node.

---

## 4. Proposed Architecture (Cloud-Native)

To adhere to the **CRITICAL SECURITY MANDATE** (no client-side API keys), the following flow is implemented:

1.  **Hardware (ESP32):** Pushes data to Firebase. Can also directly call the `triggerHardwareAlert` API for immediate delivery.
2.  **Backend Proxy (Vercel):** `api/sendSMS.js` and `api/triggerHardwareAlert.js` handle the PhilSMS API calls securely using `PHILSMS_API_TOKEN`.
3.  **Logic:**
    - Checks for critical thresholds (TDS/PPM).
    - Fetches the `mobileNum` of the assigned user.
    - Triggers the SMS via PhilSMS.

---

## 5. Implementation Roadmap

### Phase 1: Backend Setup (Completed)

- Integrated PhilSMS via `api/sendSMS.js` and `api/triggerHardwareAlert.js`.
- Configured environment variables: `PHILSMS_API_TOKEN` and `PHILSMS_SENDER_ID`.

### Phase 2: Notification Service Extension

- Updated `src/services/notification.service.js` to point to the new backend endpoint.

### Phase 3: Trigger Integration

- Hardware alerts can now trigger SMS directly via `triggerHardwareAlert` endpoint.

### Phase 4: UI Updates

- Add an "SMS Alerts" toggle in the User Profile/Settings.
- Ensure the `mobileNum` field is validated (e.g., `639...`).

---

## 6. Audit Conclusion

Implementing SMS via a provider like **PhilSMS** is the most robust and secure approach for the Philippine context. It leverages existing project patterns (Serverless APIs), ensures critical alerts are delivered offline, and simplifies billing via GCash.
