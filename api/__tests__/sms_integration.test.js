import { vi, describe, it, expect, beforeEach } from "vitest";
import triggerHardwareAlert from "../triggerHardwareAlert.js";
import retryOutbox from "../sms/retry_outbox.js";
import { initFirebaseAdmin } from "../_utils/firebase.js";
import * as outboxUtils from "../_utils/outbox.js";

// Mock Firebase Admin
vi.mock("../_utils/firebase.js", () => ({
  initFirebaseAdmin: vi.fn(),
}));

// Mock Response Utils
vi.mock("../_utils/response.js", () => ({
  sendSuccess: vi.fn((res, data) => {
    res.status(200);
    res.json(data);
    return { success: true };
  }),
  sendError: vi.fn((res, msg, status, code) => {
    res.status(status);
    res.json({ error: msg, code });
    return { success: false };
  }),
  handleOptions: vi.fn(() => false),
}));

// Mock Outbox Utils
vi.mock("../_utils/outbox.js", () => ({
  saveToOutbox: vi.fn().mockResolvedValue({}),
  markOutboxSynced: vi.fn().mockResolvedValue({}),
  getPendingOutboxEntries: vi.fn(),
  updateOutboxAttempt: vi.fn().mockResolvedValue({}),
}));

// Mock SMS Control
vi.mock("../_utils/sms_control.js", () => ({
  isSmsDispatchPaused: vi.fn().mockResolvedValue(false),
}));

// Mock Global Fetch
global.fetch = vi.fn();

// Mock Axios
import axios from "axios";
vi.mock("axios");

describe("Parent -> Standalone API Integration", () => {
  let req, res, mockDb;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SMS_API_URL = "https://standalone-api.test";
    process.env.SMS_API_INGEST_URL = "https://standalone-api.test/ingest";
    process.env.PARENT_AUTH_SECRET = "parent-secret";
    process.env.SMS_API_KEY = "api-key";
    process.env.SMS_RETRY_CRON_SECRET = "cron-secret";

    mockDb = {
      ref: vi.fn((_path) => {
        const ref = {
          get: vi.fn(),
          set: vi.fn().mockResolvedValue({}),
          update: vi.fn().mockResolvedValue({}),
          push: vi.fn().mockResolvedValue({}),
          transaction: vi.fn().mockResolvedValue({ committed: true }),
          child: vi.fn().mockReturnThis(),
        };
        return ref;
      }),
    };
    initFirebaseAdmin.mockReturnValue({ db: mockDb });

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn(),
    };
  });

  describe("triggerHardwareAlert Integration", () => {
    it("should call standalone API with correct headers and body", async () => {
      req = {
        method: "POST",
        body: { deviceId: "dev123", tdsValue: 100, secretKey: "token123" },
      };

      mockDb.ref.mockImplementation((_path) => {
        const ref = {
          get: vi.fn(),
          set: vi.fn().mockResolvedValue({}),
          update: vi.fn().mockResolvedValue({}),
          push: vi.fn().mockResolvedValue({}),
          transaction: vi.fn().mockResolvedValue({ committed: true }),
          child: vi.fn().mockReturnThis(),
        };
        if (_path.includes("device_information")) {
          ref.get.mockResolvedValue({ exists: () => true, val: () => ({ token: "token123" }) });
        } else if (_path.includes("system_metadata/alerts")) {
          ref.get.mockResolvedValue({ exists: () => false });
        } else if (_path.includes("device_assignments")) {
          ref.get.mockResolvedValue({ exists: () => true, val: () => ({ userId: "user123" }) });
        } else if (_path.includes("users")) {
          ref.get.mockResolvedValue({
            exists: () => true,
            val: () => ({ mobileNum: "123456789" }),
          });
        }
        return ref;
      });

      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      await triggerHardwareAlert(req, res);

      expect(fetch).toHaveBeenCalledWith(
        "https://standalone-api.test/api/triggerHardwareAlert",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Parent-Auth": "parent-secret",
          },
          body: JSON.stringify({ deviceId: "dev123", tdsValue: 100, secretKey: "token123" }),
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should handle standalone API 500 errors gracefully", async () => {
      req = {
        method: "POST",
        body: { deviceId: "dev123", tdsValue: 100, secretKey: "token123" },
      };

      mockDb.ref.mockImplementation((_path) => {
        const ref = {
          get: vi.fn(),
          set: vi.fn().mockResolvedValue({}),
          update: vi.fn().mockResolvedValue({}),
          push: vi.fn().mockResolvedValue({}),
          transaction: vi.fn().mockResolvedValue({ committed: true }),
          child: vi.fn().mockReturnThis(),
        };
        if (_path.includes("device_information")) {
          ref.get.mockResolvedValue({ exists: () => true, val: () => ({ token: "token123" }) });
        } else if (_path.includes("system_metadata/alerts")) {
          ref.get.mockResolvedValue({ exists: () => false });
        } else if (_path.includes("device_assignments")) {
          ref.get.mockResolvedValue({ exists: () => true, val: () => ({ userId: "user123" }) });
        } else if (_path.includes("users")) {
          ref.get.mockResolvedValue({
            exists: () => true,
            val: () => ({ mobileNum: "123456789" }),
          });
        }
        return ref;
      });

      fetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ message: "Internal Server Error" }),
      });

      await triggerHardwareAlert(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should handle standalone API network failures gracefully", async () => {
      req = {
        method: "POST",
        body: { deviceId: "dev123", tdsValue: 100, secretKey: "token123" },
      };

      mockDb.ref.mockImplementation((_path) => {
        const ref = {
          get: vi.fn(),
          set: vi.fn().mockResolvedValue({}),
          update: vi.fn().mockResolvedValue({}),
          push: vi.fn().mockResolvedValue({}),
          transaction: vi.fn().mockResolvedValue({ committed: true }),
          child: vi.fn().mockReturnThis(),
        };
        if (_path.includes("device_information")) {
          ref.get.mockResolvedValue({ exists: () => true, val: () => ({ token: "token123" }) });
        } else if (_path.includes("system_metadata/alerts")) {
          ref.get.mockResolvedValue({ exists: () => false });
        } else if (_path.includes("device_assignments")) {
          ref.get.mockResolvedValue({ exists: () => true, val: () => ({ userId: "user123" }) });
        } else if (_path.includes("users")) {
          ref.get.mockResolvedValue({
            exists: () => true,
            val: () => ({ mobileNum: "123456789" }),
          });
        }
        return ref;
      });

      fetch.mockRejectedValue(new Error("Network Timeout"));

      await triggerHardwareAlert(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should handle standalone API malformed JSON responses gracefully", async () => {
      req = {
        method: "POST",
        body: { deviceId: "dev123", tdsValue: 100, secretKey: "token123" },
      };

      mockDb.ref.mockImplementation((_path) => {
        const ref = {
          get: vi.fn(),
          set: vi.fn().mockResolvedValue({}),
          update: vi.fn().mockResolvedValue({}),
          push: vi.fn().mockResolvedValue({}),
          transaction: vi.fn().mockResolvedValue({ committed: true }),
          child: vi.fn().mockReturnThis(),
        };
        if (_path.includes("device_information")) {
          ref.get.mockResolvedValue({ exists: () => true, val: () => ({ token: "token123" }) });
        } else if (_path.includes("system_metadata/alerts")) {
          ref.get.mockResolvedValue({ exists: () => false });
        } else if (_path.includes("device_assignments")) {
          ref.get.mockResolvedValue({ exists: () => true, val: () => ({ userId: "user123" }) });
        } else if (_path.includes("users")) {
          ref.get.mockResolvedValue({
            exists: () => true,
            val: () => ({ mobileNum: "123456789" }),
          });
        }
        return ref;
      });

      fetch.mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error("Unexpected token < in JSON");
        },
      });

      await triggerHardwareAlert(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("retryOutbox Integration", () => {
    it("should call standalone ingest API with correct payload", async () => {
      req = { headers: { "x-cron-secret": "cron-secret" } };

      mockDb.ref.mockImplementation((_path) => ({
        transaction: vi.fn().mockResolvedValue({ committed: true }),
      }));

      const mockPending = {
        val: () => ({
          evt1: { number: "123", message: "hello", deviceId: "dev1", createdAt: Date.now() },
        }),
      };
      outboxUtils.getPendingOutboxEntries.mockResolvedValue(mockPending);

      axios.post.mockResolvedValue({ status: 200 });

      await retryOutbox(req, res);

      expect(axios.post).toHaveBeenCalledWith(
        "https://standalone-api.test/ingest",
        {
          number: "123",
          message: "hello",
          deviceId: "dev1",
          eventId: "evt1",
        },
        expect.objectContaining({
          headers: { "x-api-key": "api-key" },
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should handle standalone ingest API network failures by updating attempt count", async () => {
      req = { headers: { "x-cron-secret": "cron-secret" } };

      mockDb.ref.mockImplementation((_path) => ({
        transaction: vi.fn().mockResolvedValue({ committed: true }),
        get: vi.fn().mockResolvedValue({ exists: () => true, val: () => ({ attempts: 0 }) }),
        update: vi.fn().mockResolvedValue({}),
      }));

      const mockPending = {
        val: () => ({
          evt1: { number: "123", message: "hello", deviceId: "dev1", createdAt: Date.now() },
        }),
      };
      outboxUtils.getPendingOutboxEntries.mockResolvedValue(mockPending);

      axios.post.mockRejectedValue(new Error("Connection Reset"));

      await retryOutbox(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
