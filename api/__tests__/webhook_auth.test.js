import { describe, it, expect, vi, beforeEach } from "vitest";
import { initFirebaseAdmin } from "../_utils/firebase.js";
import webhookHandler from "../sms/webhook.js";

process.env.FIREBASE_DATABASE_EMULATOR_HOST = "localhost:9000";
process.env.FIREBASE_PROJECT_ID = "saltwater-test-local";
process.env.FIREBASE_DATABASE_URL = "http://localhost:9000";

describe("UniSMS Webhook Validation and Auth Tests", () => {
  let mockRes;
  let db;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis(),
    };
    const admin = initFirebaseAdmin();
    db = admin.db;
  });

  it("should return 401 when webhook-secret-key header is missing", async () => {
    process.env.UNISMS_WEBHOOK_SECRET = "test-secret";
    const mockReq = {
      method: "POST",
      headers: {},
      body: {},
    };
    const dbSpy = vi.spyOn(db, "ref");
    await webhookHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(dbSpy).not.toHaveBeenCalled();
  });

  it("should return 401 when secret does not match", async () => {
    process.env.UNISMS_WEBHOOK_SECRET = "correct-secret";
    const mockReq = {
      method: "POST",
      headers: { "webhook-secret-key": "wrong-secret" },
      body: {},
    };
    const dbSpy = vi.spyOn(db, "ref");
    await webhookHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(dbSpy).not.toHaveBeenCalled();
  });

  it("should return 400 when body is not an object", async () => {
    process.env.UNISMS_WEBHOOK_SECRET = "secret";
    const mockReq = {
      method: "POST",
      headers: { "webhook-secret-key": "secret" },
      body: "not-an-object",
    };
    const dbSpy = vi.spyOn(db, "ref");
    await webhookHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(dbSpy).not.toHaveBeenCalled();
  });

  it("should return 400 when message ID is missing or empty", async () => {
    process.env.UNISMS_WEBHOOK_SECRET = "secret";
    const mockReq = {
      method: "POST",
      headers: { "webhook-secret-key": "secret" },
      body: { event: "message.sent" },
    };
    const dbSpy = vi.spyOn(db, "ref");
    await webhookHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(dbSpy).not.toHaveBeenCalled();
  });

  it("should return 400 when event type is missing or unsupported", async () => {
    process.env.UNISMS_WEBHOOK_SECRET = "secret";
    const mockReq = {
      method: "POST",
      headers: { "webhook-secret-key": "secret" },
      body: { id: "msg_123", event: "unsupported.event" },
    };
    const dbSpy = vi.spyOn(db, "ref");
    await webhookHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(dbSpy).not.toHaveBeenCalled();
  });

  it("should pass validation when payload is correct", async () => {
    const secret = "valid-secret";
    process.env.UNISMS_WEBHOOK_SECRET = secret;
    const mockReq = {
      method: "POST",
      headers: { "webhook-secret-key": secret },
      body: { id: "msg_123", event: "message.sent" },
    };
    
    const refSpy = vi.spyOn(db, "ref").mockReturnValue({
      transaction: vi.fn().mockResolvedValue({ committed: true }),
      get: vi.fn().mockResolvedValue({ exists: () => false }),
      update: vi.fn().mockResolvedValue(true),
      push: vi.fn().mockResolvedValue({}),
    });

    await webhookHandler(mockReq, mockRes);
    expect(mockRes.status).not.toHaveBeenCalledWith(400);
    expect(mockRes.status).not.toHaveBeenCalledWith(401);
    expect(refSpy).toHaveBeenCalled();
  });
});
