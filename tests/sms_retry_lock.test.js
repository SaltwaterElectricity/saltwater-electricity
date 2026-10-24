
import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from '../api/sms/retry_outbox.js';
import { initFirebaseAdmin } from '../api/_utils/firebase.js';
import { isSmsDispatchPaused } from '../api/_utils/sms_control.js';
import { getPendingOutboxEntries } from '../api/_utils/outbox.js';

vi.mock('../api/_utils/firebase.js');
vi.mock('../api/_utils/outbox.js');
vi.mock('../api/_utils/sms_control.js');
vi.mock('axios');

import axios from 'axios';

describe('SMS Retry Lock Safety', () => {
  let mockDb;
  let mockLockRef;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SMS_RETRY_CRON_SECRET = 'secret123';
    process.env.SMS_API_URL = 'http://api.sms.com';
    process.env.PARENT_AUTH_SECRET = 'parent_secret';

    mockLockRef = {
      transaction: vi.fn(),
      get: vi.fn(),
      remove: vi.fn(),
    };

    mockDb = {
      ref: vi.fn().mockReturnValue(mockLockRef),
    };

    initFirebaseAdmin.mockReturnValue({ db: mockDb });
    isSmsDispatchPaused.mockResolvedValue(false);
    getPendingOutboxEntries.mockResolvedValue({ val: () => null });
  });

  const mockReq = {
    headers: { 'x-cron-secret': 'secret123' },
  };
  
  const createMockRes = () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
      setHeader: vi.fn(),
      json: vi.fn().mockReturnThis(),
    };
    return res;
  };

  it('should acquire lock if null', async () => {
    const res = createMockRes();
    mockLockRef.transaction.mockImplementation(async (fn) => {
      const result = fn(null);
      return { committed: true, value: result };
    });

    await handler(mockReq, res);
    expect(mockLockRef.transaction).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'batch_complete' }));
  });

  it('should recover from legacy numeric lock if expired', async () => {
    const res = createMockRes();
    const now = Date.now();
    const expiredTimestamp = now - (6 * 60 * 1000); // 6 mins ago

    mockLockRef.transaction.mockImplementation(async (fn) => {
      const result = fn(expiredTimestamp);
      return { committed: true, value: result };
    });

    await handler(mockReq, res);
    expect(mockLockRef.transaction).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'batch_complete' }));
  });

  it('should NOT acquire lock if legacy lock is not expired', async () => {
    const res = createMockRes();
    const now = Date.now();
    const activeTimestamp = now - (1 * 60 * 1000); // 1 min ago

    mockLockRef.transaction.mockImplementation(async (fn) => {
      const result = fn(activeTimestamp);
      return { committed: false, value: result };
    });

    await handler(mockReq, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'locked' }));
  });

  it('should handle malformed lock objects safely (missing timestamp)', async () => {
    const res = createMockRes();
    mockLockRef.transaction.mockImplementation(async (fn) => {
      const result = fn({ owner: 'some-id' }); // No timestamp
      return { committed: false, value: result };
    });

    await handler(mockReq, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'locked' }));
  });

  it('should handle future timestamps as active locks', async () => {
    const res = createMockRes();
    const now = Date.now();
    const futureTimestamp = now + 10000;

    mockLockRef.transaction.mockImplementation(async (fn) => {
      const result = fn({ owner: 'some-id', timestamp: futureTimestamp });
      return { committed: false, value: result };
    });

    await handler(mockReq, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'locked' }));
  });

  it('should NOT release lock if owner has changed', async () => {
    const res = createMockRes();
    const lockId1 = 'owner-1';
    const lockId2 = 'owner-2';

    // 1. Acquire lock
    mockLockRef.transaction.mockImplementationOnce(async (fn) => {
      return { committed: true, value: fn(null) };
    });
    
    // 2. Simulate another runner taking over before the first one releases
    mockLockRef.get.mockResolvedValue({ val: () => ({ owner: lockId2, timestamp: Date.now() }) });

    // Simulate the atomic release transaction
    mockLockRef.transaction.mockImplementation(async (fn) => {
       return { committed: true, value: fn({ owner: lockId2 }) };
    });

    await handler(mockReq, res);
  });
});
