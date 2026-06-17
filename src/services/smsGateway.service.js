import { ref, onValue, update, query, orderByChild, equalTo } from "firebase/database";
import { db } from "../firebaseConfig";
import { logger } from "../utils/logger";

/**
 * SMS GATEWAY SERVICE (Private Android Mode)
 * 
 * This service transforms your Android device into a private SMS sender.
 * It listens to the 'sms_queue' in Firebase and uses the native SIM card to send alerts.
 * 
 * REQUIREMENTS:
 * 1. cordova-sms-plugin
 * 2. cordova-plugin-background-mode (Recommended)
 */

class SmsGatewayService {
  constructor() {
    this.unsubscribe = null;
    this.isProcessing = false;
    this.myUid = null;
  }

  /**
   * Initializes the listener.
   * Only proceeds if running in a Cordova environment.
   */
  init(userId) {
    if (!userId) return;
    this.myUid = userId;

    // 🛡️ ENVIRONMENT CHECK: Only run on actual mobile devices
    if (typeof window.SMS === "undefined") {
      logger.info("[SMS Gateway]: Native SMS plugin not detected. Standby mode.");
      return;
    }

    logger.info("[SMS Gateway]: Initializing Android SMS Listener...");

    // Enable Background Mode if plugin is available
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.backgroundMode) {
      window.cordova.plugins.backgroundMode.enable();
      window.cordova.plugins.backgroundMode.on("activate", () => {
        window.cordova.plugins.backgroundMode.disableWebViewOptimizations();
        logger.info("[SMS Gateway]: Background Mode Active.");
      });
    }

    const queueRef = ref(db, "sms_queue");
    // Only listen for pending messages assigned to this gateway (your UID)
    const pendingQuery = query(
      queueRef,
      orderByChild("status"),
      equalTo("pending")
    );

    this.unsubscribe = onValue(pendingQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        this.processQueue(data);
      }
    });
  }

  /**
   * Processes the queue items one by one.
   */
  async processQueue(queueData) {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const entries = Object.entries(queueData);
    
    for (const [id, payload] of entries) {
      // 🛡️ AUTH CHECK: Ensure only items intended for this specific device/user are processed
      if (payload.gatewayUid !== this.myUid) continue;

      try {
        await this.sendSmsNative(id, payload);
      } catch (error) {
        logger.error(`[SMS Gateway]: Failed to process ${id}`, error);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Invokes the native Android SMS Manager via Cordova.
   */
  sendSmsNative(id, payload) {
    return new Promise((resolve, reject) => {
      const { number, message } = payload;

      const options = {
        replaceLineBreaks: true,
        android: {
          intent: "" // "" means send directly without opening the SMS app
        }
      };

      window.SMS.send(
        number,
        message,
        options,
        async () => {
          logger.info(`[SMS Gateway]: Successfully sent SMS to ${number}`);
          await this.markAsSent(id);
          resolve();
        },
        async (err) => {
          logger.error(`[SMS Gateway]: Native send error`, err);
          await this.markAsFailed(id, err);
          reject(err);
        }
      );
    });
  }

  async markAsSent(id) {
    const itemRef = ref(db, `sms_queue/${id}`);
    await update(itemRef, {
      status: "sent",
      sentAt: Date.now(),
      error: null
    });
  }

  async markAsFailed(id, error) {
    const itemRef = ref(db, `sms_queue/${id}`);
    await update(itemRef, {
      status: "failed",
      error: error?.toString() || "Unknown native error"
    });
  }

  stop() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}

export const smsGateway = new SmsGatewayService();
export default smsGateway;
