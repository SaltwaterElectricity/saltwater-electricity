import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processQueueBatch, submitToUniSMS } from '../sms/sms.service.js';

vi.mock('../sms/sms.service.js', async () => {
  const actual = await vi.importActual('../sms/sms.service.js');
  return {
    ...actual,
    submitToUniSMS: vi.fn(),
  };
});

vi.mock('../_utils/firebase.js', () => {
  const mockDb = {
    ref: vi.fn().mockReturnThis(),
    child: vi.fn().mockReturnThis(),
    orderByChild: vi.fn().mockReturnThis(),
    startAt: vi.fn().mockReturnThis(),
    endAt: vi.fn().mockReturnThis(),
    limitToFirst: vi.fn().mockReturnThis(),
    once: vi.fn(),
    transaction: vi.fn(),
    set: vi.fn().mockResolvedValue(true),
    update: vi.fn().mockResolvedValue(true),
  };
  return {
    initFirebaseAdmin: () => ({ db: mockDb }),
  };
});

import { initFirebaseAdmin } from "../_utils/firebase.js";

describe("SMS Queue Quarantine Safety", () => {
  let db;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    db = initFirebaseAdmin().db;
  });

  it('should ignore records with status "prov_acc_unknown"', async () => {
    const mockRecords = {
      msg_unknown: {
        status: "prov_acc_unknown",
        sortKey: "100_unknown",
        submissionCount: 1,
      },
      msg_pending: {
        status: "pending",
        sortKey: "101_pending",
        submissionCount: 0,
      },
    };

    db.once.mockResolvedValue({
      val: () => mockRecords,
    });

    // Mock the submission and finalization for the pending message
    submitToUniSMS.mockResolvedValue({ status: "accepted", refId: "ref123" });
    db.ref().child().transaction.mockResolvedValue({ committed: true });

    const result = await processQueueBatch(db, {
      cursor: "0",
      batchSize: 10,
      maxDurationMs: 10000,
      deadlineBufferMs: 3000,
    });

    // Should only process the pending one
    expect(result.processed).toBe(1);

    // Verify that the unknown one was never claimed (no transaction called for it)
    // We can check the calls to db.ref().child()
    const calledIds = db.ref().child.mock.calls.map((call) => call[0]);
    expect(calledIds).not.toContain("msg_unknown");
    expect(calledIds).toContain("msg_pending");
  });
});
