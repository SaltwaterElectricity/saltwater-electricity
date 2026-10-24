
import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from '../api/sms/retry_outbox.js';
import { initFirebaseAdmin } from '../api/_utils/firebase.js';
import * as sms_control from '../api/_utils/sms_control.js';
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
    sms_control.isSmsDispatchPaused.mockResolvedValue(false);
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
    const expiredTimestamp = now - 6 * 60 * 1000; // 6 mins ago

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
    const activeTimestamp = now - 1 * 60 * 1000; // 1 min ago

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

  it('should protect lock ownership: A acquires, B steals, A cannot release', async () => {
    const res = createMockRes();
    
    // 1. Simulate Owner A acquiring lock
    mockLockRef.transaction.mockImplementationOnce(async (fn) => {
      const result = fn(null);
      return { committed: true, value: result };
    });
    
    // 2. Simulate that by the time A tries to release, Owner B has taken over
    const otherOwner = { owner: 'other-runner', timestamp: Date.now() };
    let releaseResult = null;
    
    mockLockRef.transaction.mockImplementation(async (fn) => {
      releaseResult = fn(otherOwner);
      return { committed: true, value: releaseResult };
    });

    await handler(mockReq, res);
    
    // releaseResult must be undefined (meaning the transaction returned 'return;')
    // and NOT null (which would mean 'return null' -> delete lock)
    expect(releaseResult).toBeUndefined();
    expect(releaseResult).not.toBeNull();
  });

  it('should NOT acquire lock or call API if dispatch is paused', async () => {
    const res = createMockRes();
    sms_control.isSmsDispatchPaused.mockResolvedValue(true);
    
    await handler(mockReq, res);
    
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'paused' }));
    expect(mockLockRef.transaction).not.toHaveBeenCalled();
  });

  it('should fail closed (paused) if isSmsDispatchPaused returns true', async () => {
    const res = createMockRes();
    sms_control.isSmsDispatchPaused.mockResolvedValue(true);
    
    await handler(mockReq, res);
    
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'paused' }));
    expect(mockLockRef.transaction).not.toHaveBeenCalled();
  });

  it('should fail closed (500) if isSmsDispatchPaused throws', async () => {
    const res = createMockRes();
    sms_control.isSmsDispatchPaused.mockRejectedValue(new Error('DB connection failed'));
    
    await handler(mockReq, res);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(mockLockRef.transaction).not.toHaveBeenCalled();
  });
});
