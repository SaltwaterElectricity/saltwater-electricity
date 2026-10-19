import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { initFirebaseAdmin } from "../_utils/firebase.js";

// 1. Set environment variables BEFORE importing handlers to avoid top-level SDK initialization
process.env.FIREBASE_DATABASE_EMULATOR_HOST = "localhost:9000";
process.env.FIREBASE_PROJECT_ID = "saltwater-test-local";
process.env.FIREBASE_DATABASE_URL = "http://localhost:9000";
process.env.FIREBASE_CLIENT_EMAIL = "test@saltwater-test-local.iam.gserviceaccount.com";
process.env.FIREBASE_PRIVATE_KEY = "mock-key";
process.env.FIREBASE_DATABASE_EMULATOR = "true";

// 2. Now import the handlers
import handler from "../sms/worker.js";
import webhookHandler from "../sms/webhook.js";
import triggerHandler from "../triggerHardwareAlert.js";

describe("UniSMS Migration - Emulator Integration Tests", () => {

  let mockRes;
  let db;

  beforeAll(async () => {
    // Environment variables already set at top of file
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis(),
    };

    // Force re-initialization if necessary or get existing
    const admin = initFirebaseAdmin();
    db = admin.db;

    // Clear emulator state - only if db is ready
    try {
      if (db) {
        // Use a shorter timeout for the cleanup
        await Promise.race([
          Promise.all([db.ref("sms_queue").remove(), db.ref("sms_queue_v2").remove(), db.ref("device_information").remove(), db.ref("device_assignments").remove(), db.ref("users").remove(), db.ref("system_metadata/alerts").remove()]),
          new Promise((_, reject) => setTimeout(() => reject(new Error('CLEANUP_TIMEOUT')), 5000))
        ]);
      }
    } catch (e) {
      console.error("Emulator not running or unreachable:", e.message);
    }
  }, 60000);

  describe("Producer Isolation (triggerHardwareAlert)", () => {
    const mockReq = {
      method: "POST",
      body: { deviceId: "DEV_TEST_UNIQUE", tdsValue: 500, secretKey: "TOKEN123" },
    };

    async function setupProducerData() {
      await db.ref(`device_information/DEV_TEST_UNIQUE`).set({ token: "TOKEN123" });
      await db.ref(`device_assignments/DEV_TEST_UNIQUE`).set({ userId: "USER_TEST_UNIQUE" });
      await db.ref(`users/USER_TEST_UNIQUE`).set({ mobileNum: "639123456789" });
    }

    it("should use legacy queue when ENABLE_SMS_V2 is absent", async () => {
      process.env.ENABLE_SMS_V2 = undefined;
      process.env.MASTER_GATEWAY_UID = "GW1";
      await setupProducerData();

      await triggerHandler(mockReq, mockRes);

      const legacySnapshot = await db.ref("sms_queue").once("value");
      expect(legacySnapshot.exists()).toBe(true);
      const v2Snapshot = await db.ref("sms_queue_v2").once("value");
      expect(v2Snapshot.exists()).toBe(false);
    });

    it("should use v2 queue when ENABLE_SMS_V2 is exactly 'true'", async () => {
      process.env.ENABLE_SMS_V2 = "true";
      process.env.MASTER_GATEWAY_UID = "GW1";
      await setupProducerData();

      await triggerHandler(mockReq, mockRes);

      const v2Snapshot = await db.ref("sms_queue_v2").once("value");
      expect(v2Snapshot.exists()).toBe(true);
      const legacySnapshot = await db.ref("sms_queue").once("value");
      expect(legacySnapshot.exists()).toBe(false);
    });

    it("should retain legacy behavior for invalid ENABLE_SMS_V2 values", async () => {
      const invalidValues = ["false", "TRUE", "random", ""];
      for (const val of invalidValues) {
        process.env.ENABLE_SMS_V2 = val;
        process.env.MASTER_GATEWAY_UID = "GW1";
        await setupProducerData();

        await triggerHandler(mockReq, mockRes);

        const legacySnapshot = await db.ref("sms_queue").once("value");
        expect(legacySnapshot.exists()).toBe(true);
        const v2Snapshot = await db.ref("sms_queue_v2").once("value");
        expect(v2Snapshot.exists()).toBe(false);
        await db.ref().remove();
      }
    });
  });

  describe("Worker Concurrency and Recovery", () => {
    it("should prevent concurrent claim of the same record", async () => {
      process.env.SMS_WORKER_SECRET = "secret";
      const msgId = "msg1";
      await db.ref(`sms_queue_v2/${msgId}`).set({
        status: "pending",
        sortKey: "100_msg1",
        submissionCount: 0
      });

      const mockReq = {
        method: "POST",
        headers: { "x-worker-secret": "secret" },
        body: { cursor: "0" },
      };

      // Run two worker calls in parallel
      await Promise.all([
        handler(mockReq, { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis(), setHeader: vi.fn().mockReturnThis() }),
        handler(mockReq, { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis(), setHeader: vi.fn().mockReturnThis() }),
      ]);

      // Allow async updates and UniSMS mock latency (100ms) to commit
      await new Promise(resolve => setTimeout(resolve, 1000));

      const finalRecord = await db.ref(`sms_queue_v2/${msgId}`).get();
      const val = finalRecord.val();
      // Verify the record is no longer pending and was attempted at least once
      expect(val.status).not.toBe("pending");
      expect(val.submissionCount).toBe(1); // Exactly one worker should have succeeded
    });

    it("should handle lease expiration and reclaim records", async () => {
      process.env.SMS_WORKER_SECRET = "secret";
      const msgId = "msg_expired";
      await db.ref(`sms_queue_v2/${msgId}`).set({
        status: "claimed",
        leaseExpiresAt: Date.now() - 1000,
        sortKey: "100_exp",
        submissionCount: 0
      });

      const mockReq = {
        method: "POST",
        headers: { "x-worker-secret": "secret" },
        body: { cursor: "0" },
      };

      await handler(mockReq, mockRes);
      // Allow async updates and UniSMS mock latency (100ms) to commit
      await new Promise(resolve => setTimeout(resolve, 1000));
      const record = await db.ref(`sms_queue_v2/${msgId}`).get();
      const val = record.val();

      // Verify the record was reclaimed and processed
      expect(val.status).not.toBe("claimed");
      expect(val.submissionCount).toBeGreaterThan(0);
    });

    it("should prevent stale worker from overwriting newer claim", async () => {
      process.env.SMS_WORKER_SECRET = "secret";
      const msgId = "msg_stale";

      // 1. Seed a record that is PENDING
      await db.ref(`sms_queue_v2/${msgId}`).set({
        status: "pending",
        sortKey: "100_stale",
        submissionCount: 0
      });

      // Worker A claims a pending record through the real implementation
      const mockReqA = {
        method: "POST",
        headers: { "x-worker-secret": "secret" },
        body: { cursor: "0" },
      };
      await handler(mockReqA, mockRes);

      // Capture the actual token generated for A
      const stateA = (await db.ref(`sms_queue_v2/${msgId}`).get()).val();
      const tokenA = stateA?.claimToken;
      expect(tokenA).toBeDefined();

      // 2. Force A's lease to expire and set status to 'submitting'
      // This exercises the newly added recovery path for submitting records
      await db.ref(`sms_queue_v2/${msgId}`).update({
        leaseExpiresAt: Date.now() - 1000,
        status: "submitting",
      });

      // 3. Worker B reclaims it
      const mockReq = {
        method: "POST",
        headers: { "x-worker-secret": "secret" },
        body: { cursor: "0" },
      };
      await handler(mockReq, mockRes);

      // Allow mock latency to commit
      await new Promise(resolve => setTimeout(resolve, 200));

      const stateB = (await db.ref(`sms_queue_v2/${msgId}`).get()).val();
      const tokenB = stateB.claimToken;
      expect(tokenB).toBeDefined();
      expect(tokenB).not.toBe(tokenA);

      // 3. Advance B to 'submitting' to prepare for the race
      await db.ref(`sms_queue_v2/${msgId}`).update({
        status: "submitting",
      });

      // 4. Worker A (stale) now attempts to finalize using its old token
      const { finalizeMessage } = await import("../sms/sms.service.js");
      const mockSubmission = { status: "accepted", refId: "uni_stale_test" };
      const admin = initFirebaseAdmin();
      const finalizationResult = await finalizeMessage(admin.db, msgId, tokenA, mockSubmission, { submissionCount: 1 });
      
      expect(finalizationResult.committed).toBe(false);

      // 5. Verify B's ownership remains intact
      const finalState = (await db.ref(`sms_queue_v2/${msgId}`).get()).val();
      expect(finalState.claimToken).toBe(tokenB);
      expect(finalState.status).toBe("submitting");
    });
  });

  describe("Webhook Containment (Fail-Closed)", () => {
    it("should reject requests with missing signatures and cause zero Firebase access", async () => {
      const mockReq = {
        method: "POST",
        headers: {},
        body: { eventId: "evt1", id: "prov1", event: "delivered" },
      };

      const dbSpy = vi.spyOn(db, "ref");

      db.ref.mockClear();
      await webhookHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(dbSpy).not.toHaveBeenCalled();
    });

    it("should reject requests with arbitrary signatures and cause zero Firebase access", async () => {
      const mockReq = {
        method: "POST",
        headers: { "x-unisms-signature": "fake-signature-123" },
        body: { eventId: "evt2", id: "prov2", event: "delivered" },
      };

      // Use the existing db from beforeEach instead of calling initFirebaseAdmin() again,
      // as initFirebaseAdmin might return a shared instance that is already being used.
      const dbSpy = vi.spyOn(db, "ref");

      db.ref.mockClear();
      await webhookHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(dbSpy).not.toHaveBeenCalled();
    });
  });

  describe("Webhook Idempotency & Recovery (Containment Mode)", () => {
    it("should reject previously successful requests as unauthorized", async () => {
      const mockReq = {
        method: "POST",
        headers: { "x-unisms-signature": "sig" },
        body: { eventId: "evt1", id: "prov1", event: "delivered", userId: "USER_TEST_UNIQUE" },
      };

      // Seed data that would normally be processed
      await db.ref(`sms_provider_index/prov1`).set({ msgId: "msg1" });
      await db.ref(`sms_queue_v2/msg1`).set({ status: "provider_accepted" });

      db.ref.mockClear();
      await webhookHandler(mockReq, mockRes);

      // Now expected to be 401 because of containment
      expect(mockRes.status).toHaveBeenCalledWith(401);

      // Verify that it didn't even reach the idempotency check (receipt ledger)
      const receiptSnapshot = await db.ref("webhooks_pending").get();
      expect(receiptSnapshot.exists()).toBe(false);
    });

    it("should reject recovery requests as unauthorized", async () => {
      const msgId = "msg_rec";
      await db.ref(`sms_queue_v2/${msgId}`).set({
        providerRefId: "prov_rec",
        status: "provider_accepted"
      });

      const mockReq = {
        method: "POST",
        headers: { "x-unisms-signature": "sig" },
        body: { eventId: "evt_rec", id: "prov_rec", event: "delivered", userId: "USER_TEST_UNIQUE" },
      };

      db.ref.mockClear();
      await webhookHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);

      // Verify no index was created/restored
      const indexSnap = await db.ref(`sms_provider_index/prov_rec`).get();
      expect(indexSnap.exists()).toBe(false);
    });
  });

});
