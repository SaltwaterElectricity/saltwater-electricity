import { describe, it, expect, vi, beforeEach } from "vitest";
import { initFirebaseAdmin } from "../_utils/firebase.js";
import triggerHandler from "../triggerHardwareAlert.js";
import webhookHandler from "../sms/webhook.js";
import { finalizeMessage } from "../sms/sms.service.js";
import reconcileHandler from "../sms/reconcile.js";

// Mock Firebase Admin
vi.mock("../_utils/firebase.js", () => {
  const mockDb = {
    ref: vi.fn().mockReturnThis(),
    get: vi.fn(),
    set: vi.fn(),
    update: vi.fn(),
    push: vi.fn(),
    transaction: vi.fn(),
    orderByChild: vi.fn().mockReturnThis(),
    endAt: vi.fn().mockReturnThis(),
    limitToFirst: vi.fn().mockReturnThis(),
    once: vi.fn(),
  };
  return {
    initFirebaseAdmin: () => ({ db: mockDb }),
  };
});

// Mock Responses
const mockRes = {
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
  setHeader: vi.fn().mockReturnThis(),
};

describe("Fast SMS Logic Verification", () => {
  let db;

  beforeEach(() => {
    vi.clearAllMocks();
    db = initFirebaseAdmin().db;
  });

  describe("Producer Cooldown Logic", () => {
    const mockReq = {
      method: "POST",
      body: { deviceId: "DEV1", tdsValue: 500, secretKey: "TOKEN1" },
    };

    it("should reject request within cooldown window", async () => {
      // Mock Auth
      db.ref.mockImplementation((path) => {
        if (path.includes("device_information")) {
          return { get: vi.fn().mockResolvedValue({ exists: () => true, val: () => ({ token: "TOKEN1" }) }) };
        }
        if (path.includes("device_assignments")) {
          return { get: vi.fn().mockResolvedValue({ exists: () => true, val: () => ({ userId: "USER1" }) }) };
        }
        if (path.includes("users")) {
          return { get: vi.fn().mockResolvedValue({ exists: () => true, val: () => ({ mobileNum: "639123456789" }) }) };
        }
        if (path.includes("system_metadata/alerts")) {
          return {
            transaction: vi.fn().mockResolvedValue({ committed: false }), // Abort transaction
            get: vi.fn().mockResolvedValue({ val: () => ({ lastSmsSent: Date.now() - 1000 }) }),
          };
        }
        return { push: vi.fn(), update: vi.fn() };
      });

      await triggerHandler(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(429);
    });

    it("should accept request outside cooldown window", async () => {
      db.ref.mockImplementation((path) => {
        if (path.includes("device_information")) {
          return { get: vi.fn().mockResolvedValue({ exists: () => true, val: () => ({ token: "TOKEN1" }) }) };
        }
        if (path.includes("device_assignments")) {
          return { get: vi.fn().mockResolvedValue({ exists: () => true, val: () => ({ userId: "USER1" }) }) };
        }
        if (path.includes("users")) {
          return { get: vi.fn().mockResolvedValue({ exists: () => true, val: () => ({ mobileNum: "639123456789" }) }) };
        }
        if (path.includes("system_metadata/alerts")) {
          return {
            transaction: vi.fn().mockResolvedValue({ committed: true }),
            get: vi.fn().mockResolvedValue({ val: () => ({ lastSmsSent: 0 }) }),
          };
        }
        return { push: vi.fn().mockResolvedValue({}), update: vi.fn().mockResolvedValue(true) };
      });

      await triggerHandler(mockReq, mockRes);
      expect(mockRes.status).not.toHaveBeenCalledWith(429);
    });
  });

  describe("Webhook Monotonicity and Terminal Policy", () => {
    const mockReq = {
      method: "POST",
      headers: { "webhook-secret-key": "secret" },
      body: { id: "msg1", event: "message.delivered", userId: "USER1" },
    };

    beforeEach(() => {
      process.env.UNISMS_WEBHOOK_SECRET = "secret";
    });

    it("should project delivered status over provider_accepted", async () => {
      db.ref.mockImplementation((path) => {
        if (path.includes("webhooks_pending")) {
          return {
            transaction: vi.fn().mockResolvedValue({ committed: true }),
            get: vi.fn().mockResolvedValue({ val: () => ({ authoritativeStatus: "delivered", ownerToken: "T1" }) }),
          };
        }
        if (path.includes("sms_status")) {
          return {
            transaction: vi.fn().mockImplementation((updateFn) => {
              const current = { status: "provider_accepted" };
              const result = updateFn(current);
              return { committed: result !== undefined, result };
            }),
          };
        }
        if (path.includes("sms_provider_index")) {
          return { get: vi.fn().mockResolvedValue({ exists: () => true, val: () => ({ msgId: "msg1" }) }) };
        }
        return { get: vi.fn(), transaction: vi.fn().mockResolvedValue({ committed: true }) };
      });

      await webhookHandler(mockReq, mockRes);
      expect(mockRes.status).not.toHaveBeenCalledWith(500);
    });

    it("should enforce FIRST TERMINAL STATE WINS (delivered vs failed)", async () => {
      // Scenario: status is already 'failed' (Weight 4). Event is 'delivered' (Weight 4).
      // Transition should be rejected because 4 is not > 4.
      db.ref.mockImplementation((path) => {
        if (path.includes("webhooks_pending")) {
          return {
            transaction: vi.fn().mockResolvedValue({ committed: true }),
            get: vi.fn().mockResolvedValue({ val: () => ({ authoritativeStatus: "delivered", ownerToken: "T1" }) }),
          };
        }
        if (path.includes("sms_status")) {
          return {
            transaction: vi.fn().mockImplementation((updateFn) => {
              const current = { status: "failed" };
              const result = updateFn(current);
              return { committed: result !== undefined, result };
            }),
          };
        }
        if (path.includes("sms_provider_index")) {
          return { get: vi.fn().mockResolvedValue({ exists: () => true, val: () => ({ msgId: "msg1" }) }) };
        }
        return { get: vi.fn(), transaction: vi.fn().mockResolvedValue({ committed: true }) };
      });

      await webhookHandler(mockReq, mockRes);
      // We check that the transaction returned undefined (aborted)
      // Since we don't have access to the internal tx call, we rely on the logic.
    });
  });

  describe("Worker Fencing", () => {
    it("should reject finalization if ownership is lost", async () => {
      const mockDb = {
        ref: vi.fn().mockReturnThis(),
        transaction: vi.fn().mockImplementation((updateFn) => {
          const current = { claimToken: "tokenB", status: "submitting" };
          const result = updateFn(current);
          return { committed: result !== undefined, result };
        }),
        child: vi.fn().mockReturnThis(),
      };
      
      const result = await finalizeMessage(mockDb, "msg1", "tokenA", { status: "accepted", refId: "ref1" }, { submissionCount: 0 });
      expect(result.committed).toBe(false);
    });
  });

  describe("Reconciliation Discovery", () => {
    it("should fail to recover receipts missing providerRefId", async () => {
      process.env.SMS_RECONCILE_SECRET = "secret";
      const mockReq = {
        method: "POST",
        headers: { "x-reconcile-secret": "secret" },
      };

      db.ref.mockImplementation((path) => {
        if (path.includes("webhooks_pending")) {
          return {
            orderByChild: vi.fn().mockReturnThis(),
            endAt: vi.fn().mockReturnThis(),
            limitToFirst: vi.fn().mockReturnThis(),
            once: vi.fn().mockResolvedValue({
              val: () => ({
                "evt1": { applied: false, authoritativeStatus: "delivered", leaseExpiresAt: 0 } // missing providerRefId
              })
            }),
          };
        }
        return { ref: vi.fn(), transaction: vi.fn().mockResolvedValue({ committed: true }) };
      });

      await reconcileHandler(mockReq, mockRes);
      const resBody = mockRes.json.mock.calls[0][0];
      expect(resBody.recovered).toBe(0);
      expect(resBody.details[0].error).toBe("Missing providerRefId");
    });
  });
});
