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

### **Recommendation: Use an SMS Provider (Twilio)**

For a system monitoring critical parameters like water salinity, **reliability is the top priority**. A DIY GSM module adds multiple hardware failure points and increases the power consumption of the IoT node.

---

## 4. Proposed Architecture (Cloud-Native)

To adhere to the **CRITICAL SECURITY MANDATE** (no client-side API keys), the following flow is recommended:

1.  **Hardware (ESP32):** Continues to push data to Firebase as usual. No hardware changes needed.
2.  **Trigger (Firebase Cloud Function):** A background function watches for changes in `readings/{deviceId}/latest`.
3.  **Logic:**
    - Function checks if `tds_ppm >= 500`.
    - Function fetches the `mobileNum` of the user assigned to that `deviceId`.
    - Function calls the SMS Provider API.
4.  **Backend Proxy:** A Vercel Serverless Function (similar to the current email service) handles the Twilio API call securely.

---

## 5. Implementation Roadmap

### Phase 1: Backend Setup

- Create `api/sendSMSAlert.js` using the Twilio Node.js SDK.
- Store `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` in environment variables.

### Phase 2: Notification Service Extension

- Add `sendSMSAlert` to `src/services/notification.service.js` (bridging to the API).

### Phase 3: Trigger Integration

- **Option A (Client-Side):** In `reading.service.js`, after a reading is detected, trigger the SMS. (Note: Only works if the app is open).
- **Option B (Recommended):** Deploy a Firebase Cloud Function to handle this 24/7 without the app being open.

### Phase 4: UI Updates

- Add an "SMS Alerts" toggle in the User Profile/Settings.
- Ensure the `mobileNum` field is validated for E.164 format (e.g., `+639...`).

---

## 6. Audit Conclusion

Implementing SMS via a provider like **Twilio** is the most robust and secure approach. It leverages existing project patterns (Serverless APIs) and ensures that critical alerts are delivered even when the user is offline.
