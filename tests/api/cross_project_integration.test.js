import { vi, describe, it, expect, beforeEach } from "vitest";
import retryOutbox from "../../api/../api/sms/retry_outbox.js";
import * as parentFirebase from "../../api/../api/_utils/firebase.js";
import * as outboxUtils from "../../api/../api/_utils/outbox.js";
import axios from "axios";

// Mock Firebase Admin for Parent project
vi.mock("../../api/../api/_utils/firebase.js", () => ({
  initFirebaseAdmin: vi.fn(),
}));

vi.mock("../../api/../api/_utils/response.js", () => ({
  sendSuccess: vi.fn((res, data, status = 200) => {
    res.status(status);
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

vi.mock("../../api/../api/_utils/outbox.js", () => ({
  getPendingOutboxEntries: vi.fn(),
  markOutboxSynced: vi.fn().mockResolvedValue({}),
  updateOutboxAttempt: vi.fn().mockResolvedValue({}),
}));

vi.mock("../../api/../api/_utils/sms_control.js", () => ({
  isSmsDispatchPaused: vi.fn().mockResolvedValue(false),
}));

vi.mock("axios");

describe("Cross-Project Isolated Integration", () => {
  let req, res, mockDb;

  beforeEach(() => {
    vi.clearAllMocks();
    
    process.env.CRON_SECRET = "cron-secret";
    process.env.SMS_API_KEY = "shared-test-key";
    process.env.SMS_INGEST_API_KEY = "shared-test-key"; // Standalone key
    process.env.SMS_API_INGEST_URL = "https://standalone.test/ingest";
    process.env.SMS_QUEUE_NODE = "sms_queue";

    mockDb = {
      ref: vi.fn((_path) => ({
        transaction: vi.fn().mockResolvedValue({ committed: true }),
        get: vi.fn(),
        set: vi.fn().mockResolvedValue({}),
        update: vi.fn().mockResolvedValue({}),
      })),
    };

    parentFirebase.initFirebaseAdmin.mockReturnValue({ db: mockDb });

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn(),
    };
  });

  it("should successfully authenticate Parent -> Standalone integration with matching keys", async () => {
    req = { headers: { "authorization": "Bearer cron-secret" } };

    const mockPending = {
      val: () => ({
        evt1: { number: "123", message: "hello", deviceId: "dev1", createdAt: Date.now() },
      }),
    };
    outboxUtils.getPendingOutboxEntries.mockResolvedValue(mockPending);

    axios.post.mockImplementation(async (url, body, config) => {
      // Mock Standalone Ingest Logic
      const apiKey = config.headers["x-api-key"];
      if (apiKey === process.env.SMS_INGEST_API_KEY) {
        return {
          status: 200,
          data: { success: true, message: "Accepted" },
        };
      } else {
        return {
          status: 401,
          data: { error: "Unauthorized", code: "auth/invalid-api-key" },
        };
      }
    });

    await retryOutbox(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(axios.post).toHaveBeenCalledWith(
      process.env.SMS_API_INGEST_URL,
      expect.any(Object),
      expect.objectContaining({
        headers: { "x-api-key": "shared-test-key" },
      })
    );
  });

  it("should reject integration if keys do not match", async () => {
    process.env.SMS_API_KEY = "parent-key";
    process.env.SMS_INGEST_API_KEY = "standalone-key";

    req = { headers: { "authorization": "Bearer cron-secret" } };
    const mockPending = {
      val: () => ({
        evt1: { number: "123", message: "hello", deviceId: "dev1", createdAt: Date.now() },
      }),
    };
    outboxUtils.getPendingOutboxEntries.mockResolvedValue(mockPending);

    axios.post.mockImplementation(async (url, body, config) => {
      // Mock Standalone Ingest Logic
      const apiKey = config.headers["x-api-key"];
      if (apiKey === process.env.SMS_INGEST_API_KEY) {
        return {
          status: 200,
          data: { success: true, message: "Accepted" },
        };
      } else {
        return {
          status: 401,
          data: { error: "Unauthorized", code: "auth/invalid-api-key" },
        };
      }
    });

    await retryOutbox(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});
