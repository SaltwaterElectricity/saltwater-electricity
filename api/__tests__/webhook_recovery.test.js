import { describe, it, expect, vi, beforeEach } from "vitest";
import { initFirebaseAdmin } from "../_utils/firebase.js";
import handler from "../sms/webhook.js";

// --- Mock Firebase Implementation ---
class MockRef {
  constructor(path, db) {
    this.path = path;
    this.db = db;
  }

  async get() {
    const val = this._getValue();
    return {
      val: () => val,
      exists: () => val !== undefined,
    };
  }

  async once(event) {
    if (event === "value") return this.get();
    throw new Error(`Unsupported event ${event}`);
  }

  async set(val) {
    this._setValue(val);
    return { committed: true };
  }

  async update(val) {
    const current = this._getValue() || {};
    this._setValue({ ...current, ...val });
    return { committed: true };
  }

  async remove() {
    this._setValue(undefined);
    return { committed: true };
  }

  async transaction(updateFn) {
    const current = this._getValue();
    const result = updateFn(current);
    if (result === undefined || result === null) {
      return { committed: false };
    }
    this._setValue(result);
    return { committed: true };
  }

  ref(subPath) {
    return new MockRef(`${this.path}/${subPath}`, this.db);
  }

  _getValue() {
    const parts = this.path.split("/").filter(Boolean);
    let current = this.db.state;
    for (const part of parts) {
      if (!current) return undefined;
      current = current[part];
    }
    return current;
  }

  _setValue(val) {
    const parts = this.path.split("/").filter(Boolean);
    if (parts.length === 0) {
      this.db.state = val;
      return;
    }
    let current = this.db.state;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) current[part] = {};
      current = current[part];
    }
    const lastPart = parts[parts.length - 1];
    if (val === undefined) {
      delete current[lastPart];
    } else {
      current[lastPart] = val;
    }
  }
}

class MockDB {
  constructor() {
    this.state = {};
  }
  ref(path = "") {
    return new MockRef(path, this);
  }
}

const globalMockDb = new MockDB();

vi.mock("../_utils/firebase.js", () => ({
  initFirebaseAdmin: vi.fn(() => ({
    db: globalMockDb,
    auth: {},
  })),
}));

describe("UniSMS Webhook Recovery Regression", () => {
  let db;
  let mockRes;

  beforeEach(async () => {
    const admin = initFirebaseAdmin();
    db = admin.db;
    globalMockDb.state = {};
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis(),
    };
  });

  const createRequest = (id, event, userId = "USER1") => ({
    method: "POST",
    headers: { "webhook-secret-key": "test-secret-123" },
    body: { id, event, userId },
  });

  it("should claim a new receipt and mark it as processing", async () => {
    process.env.UNISMS_WEBHOOK_SECRET = "test-secret-123";
    const req = createRequest("msg_1", "message.sent");
    await handler(req, mockRes);
    const receipt = await db.ref("webhooks_pending").once("value");
    const data = receipt.val();
    const eventId = Object.keys(data)[0];
    expect(data[eventId].state).toBe("processing");
    expect(data[eventId].ownerToken).toBeDefined();
    expect(data[eventId].leaseExpiresAt).toBeGreaterThan(Date.now());
  });

  it("should reject duplicate claims while lease is valid", async () => {
    process.env.UNISMS_WEBHOOK_SECRET = "test-secret-123";
    const req = createRequest("msg_1", "message.sent");
    await handler(req, mockRes);
    await handler(req, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    const resBody = mockRes.json.mock.calls[1][0];
    expect(resBody.status).toBe("already_processed");
  });

  it("should reclaim a receipt after lease expiry", async () => {
    process.env.UNISMS_WEBHOOK_SECRET = "test-secret-123";
    const req = createRequest("msg_1", "message.sent");
    await handler(req, mockRes);
    const receipts = await db.ref("webhooks_pending").once("value");
    const id = Object.keys(receipts.val())[0];
    await db.ref(`webhooks_pending/${id}`).update({
      leaseExpiresAt: Date.now() - 1000,
      ownerToken: "old-token",
    });
    await handler(req, mockRes);
    const finalReceipt = await db.ref(`webhooks_pending/${id}`).get();
    expect(finalReceipt.val().ownerToken).not.toBe("old-token");
    expect(finalReceipt.val().leaseExpiresAt).toBeGreaterThan(Date.now());
  });

  it("should deduplicate fully processed receipts", async () => {
    process.env.UNISMS_WEBHOOK_SECRET = "test-secret-123";
    const req = createRequest("msg_1", "message.sent");
    await handler(req, mockRes);
    const receipts = await db.ref("webhooks_pending").once("value");
    const id = Object.keys(receipts.val())[0];
    await db.ref(`webhooks_pending/${id}`).update({ processed: true });
    await handler(req, mockRes);
    expect(mockRes.json.mock.calls[1][0].status).toBe("already_processed");
  });

  it("should prevent a stale handler from finalizing a reclaimed receipt", async () => {
    process.env.UNISMS_WEBHOOK_SECRET = "test-secret-123";
    const req = createRequest("msg_1", "message.sent");
    await handler(req, mockRes);
    const receipts = await db.ref("webhooks_pending").once("value");
    const id = Object.keys(receipts.val())[0];
    const tokenA = receipts.val()[id].ownerToken;
    await db.ref(`webhooks_pending/${id}`).update({
      leaseExpiresAt: Date.now() - 1000,
    });
    await handler(req, mockRes);
    const receiptsB = await db.ref("webhooks_pending").once("value");
    const tokenB = receiptsB.val()[id].ownerToken;
    expect(tokenB).not.toBe(tokenA);
    const finalA = await db.ref(`webhooks_pending/${id}`).transaction((current) => {
      if (!current || current.ownerToken !== tokenA) return;
      return { processed: true };
    });
    expect(finalA.committed).toBe(false);
  });

  it("should not let a stale handler corrupt business state if state is monotonic", async () => {
    process.env.UNISMS_WEBHOOK_SECRET = "test-secret-123";
    const userId = "USER_MONO";
    const msgId = "MSG_MONO";
    const req_sent = createRequest("prov_1", "message.sent", userId);
    await db.ref(`sms_provider_index/prov_1`).set({ msgId });
    
    // Manually seed a high-weight terminal state
    await db.ref(`sms_status/${userId}/${msgId}`).set({
      status: "delivered",
      updatedAt: Date.now(),
      lastEvent: "message.delivered"
    });

    // This event maps to "failed" (Weight 4). 
    // Since delivered is also Weight 4, a strict '>' check should reject it.
    await handler(req_sent, mockRes);
    
    const status = await db.ref(`sms_status/${userId}/${msgId}`).get();
    expect(status.val().status).toBe("delivered");
  });
});
