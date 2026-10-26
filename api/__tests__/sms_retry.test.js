import { vi, describe, it, expect, beforeEach } from "vitest";
import retryOutbox from "../sms/retry_outbox.js";
import * as outbox from "../_utils/outbox.js";
import * as smsControl from "../_utils/sms_control.js";
import { initFirebaseAdmin } from "../_utils/firebase.js";
import axios from "axios";

vi.mock("../_utils/response.js", () => ({
  sendSuccess: vi.fn((res, data) => {
    res.status(200);
    res.json(data);
  }),
  sendError: vi.fn((res, err, code, id) => {
    res.status(code);
    res.json({ error: err, id });
  }),
  handleOptions: vi.fn(() => false),
}));

vi.mock("../_utils/outbox.js", () => ({
  getPendingOutboxEntries: vi.fn(),
  markOutboxSynced: vi.fn(),
  updateOutboxAttempt: vi.fn(),
}));

vi.mock("../_utils/sms_control.js", () => ({
  isSmsDispatchPaused: vi.fn(),
}));

vi.mock("../_utils/firebase.js", () => ({
  initFirebaseAdmin: vi.fn(),
}));

vi.mock("axios");

describe("SMS Retry Outbox", () => {
  let req, res;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SMS_RETRY_CRON_SECRET = "test-secret";
    process.env.SMS_API_INGEST_URL = "https://api.test/ingest";
    process.env.SMS_API_KEY = "test-api-key";

    res = {
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      end: vi.fn(),
    };
  });

  it("should return 401 if cron secret is missing", async () => {
    req = {
      headers: {},
    };
    await retryOutbox(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("should return 401 if cron secret is incorrect", async () => {
    req = {
      headers: { "x-cron-secret": "wrong-secret" },
    };
    await retryOutbox(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("should return success if SMS dispatch is paused", async () => {
    req = {
      headers: { "x-cron-secret": "test-secret" },
    };
    smsControl.isSmsDispatchPaused.mockResolvedValue(true);

    await retryOutbox(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: "paused" }));
  });

  it("should return locked if concurrency lock cannot be acquired", async () => {
    req = {
      headers: { "x-cron-secret": "test-secret" },
    };
    smsControl.isSmsDispatchPaused.mockResolvedValue(false);

    const mockDb = {
      ref: vi.fn().mockReturnValue({
        transaction: vi.fn().mockResolvedValue({ committed: false }),
      }),
    };
    initFirebaseAdmin.mockReturnValue({ db: mockDb });

    await retryOutbox(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: "locked" }));
  });

  it("should process pending entries and return success", async () => {
    req = {
      headers: { "x-cron-secret": "test-secret" },
    };
    smsControl.isSmsDispatchPaused.mockResolvedValue(false);

    const mockDb = {
      ref: vi.fn().mockReturnValue({
        transaction: vi.fn((cb) => {
          const result = cb(null);
          return Promise.resolve({ committed: true, snapshot: { val: () => result } });
        }),
      }),
    };
    initFirebaseAdmin.mockReturnValue({ db: mockDb });

    outbox.getPendingOutboxEntries.mockResolvedValue({
      val: () => ({
        evt1: { number: "123", message: "hi", deviceId: "d1", createdAt: Date.now() },
      }),
    });

    axios.post.mockResolvedValue({ status: 200 });

    await retryOutbox(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ processed: 1, status: "batch_complete" })
    );
    expect(outbox.markOutboxSynced).toHaveBeenCalledWith("evt1");
  });

  it("should handle internal errors and return 500", async () => {
    req = {
      headers: { "x-cron-secret": "test-secret" },
    };
    smsControl.isSmsDispatchPaused.mockImplementation(() => {
      throw new Error("Unexpected crash");
    });

    await retryOutbox(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
