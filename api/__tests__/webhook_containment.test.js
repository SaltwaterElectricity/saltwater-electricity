import { describe, it, expect, vi, beforeEach } from "vitest";
import { initFirebaseAdmin } from "../_utils/firebase.js";
import webhookHandler from "../sms/webhook.js";

process.env.FIREBASE_DATABASE_EMULATOR_HOST = "localhost:9000";
process.env.FIREBASE_PROJECT_ID = "saltwater-test-local";
process.env.FIREBASE_DATABASE_URL = "http://localhost:9000";

describe("Webhook Containment Isolation Test", () => {
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

  it("should reject requests without signature and NOT call db.ref", async () => {
    const mockReq = {
      method: "POST",
      headers: {},
      body: { id: "msg1", event: "message.sent" },
    };
    const dbSpy = vi.spyOn(db, "ref");
    await webhookHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(dbSpy).not.toHaveBeenCalled();
  });

  it("should reject requests with fake signature and NOT call db.ref", async () => {
    process.env.UNISMS_WEBHOOK_SECRET = "correct-secret";
    const mockReq = {
      method: "POST",
      headers: { "webhook-secret-key": "fake" },
      body: { id: "msg1", event: "message.sent" },
    };
    const dbSpy = vi.spyOn(db, "ref");
    await webhookHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(dbSpy).not.toHaveBeenCalled();
  });
});
