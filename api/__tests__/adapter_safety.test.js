
import { describe, it, expect } from 'vitest';
import { submitToUniSMS } from '../sms/sms.service.js';

describe('UniSMS Adapter Safety', () => {
  const mockRecord = { recipient: '639123456789', message: 'Test' };

  it('should return mock results when UNISMS_LIVE_SEND_ENABLED is not "true"', async () => {
    process.env.UNISMS_LIVE_SEND_ENABLED = 'false';
    const result = await submitToUniSMS(mockRecord);
    expect(result).toHaveProperty('status');
    expect(['accepted', 'rejected']).toContain(result.status);
  });

  it('should throw SECURITY error when UNISMS_LIVE_SEND_ENABLED is "true"', async () => {
    process.env.UNISMS_LIVE_SEND_ENABLED = 'true';
    await expect(submitToUniSMS(mockRecord)).rejects.toThrow('[SECURITY]');
  });
});
