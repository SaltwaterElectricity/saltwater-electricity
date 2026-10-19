
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitToUniSMS } from '../sms/sms.service.js';
import axios from 'axios';

vi.mock('axios');

describe('UniSMS Adapter Implementation', () => {
  const mockRecord = { 
    number: '639123456789', 
    message: 'Test Message', 
    providerRefId: null 
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.UNISMS_API_KEY = 'test-key';
    process.env.UNISMS_SENDER_ID = 'test-sender';
    process.env.UNISMS_API_URL = 'https://unismsapi.com/api';
  });

  it('should use mock mode by default', async () => {
    process.env.UNISMS_LIVE_SEND_ENABLED = 'false';
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const result = await submitToUniSMS(mockRecord);
    expect(result).toEqual({ status: 'accepted', refId: expect.stringContaining('uni_') });
    expect(axios.post).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should throw error when live-send enabled but config missing', async () => {
    process.env.UNISMS_LIVE_SEND_ENABLED = 'true';
    delete process.env.UNISMS_API_KEY;
    await expect(submitToUniSMS(mockRecord)).rejects.toThrow('[SECURITY]');
  });

  it('should return accepted when provider returns 201 with reference_id', async () => {
    process.env.UNISMS_LIVE_SEND_ENABLED = 'true';
    axios.post.mockResolvedValue({
      status: 201,
      data: { message: { reference_id: 'ref123' } }
    });

    const result = await submitToUniSMS(mockRecord);
    expect(result).toEqual({ status: 'accepted', refId: 'ref123' });
  });

  it('should return unknown when provider returns 201 without reference_id', async () => {
    process.env.UNISMS_LIVE_SEND_ENABLED = 'true';
    axios.post.mockResolvedValue({
      status: 201,
      data: { message: {} }
    });

    const result = await submitToUniSMS(mockRecord);
    expect(result.status).toBe('unknown');
    expect(result.error).toContain('Missing reference_id');
  });

  it('should return rejected when provider returns 400', async () => {
    process.env.UNISMS_LIVE_SEND_ENABLED = 'true';
    axios.post.mockRejectedValue({
      response: { status: 400 }
    });

    const result = await submitToUniSMS(mockRecord);
    expect(result.status).toBe('rejected');
    expect(result.error).toContain('Provider rejection: 400');
  });

  it('should return unknown when provider returns 429', async () => {
    process.env.UNISMS_LIVE_SEND_ENABLED = 'true';
    axios.post.mockRejectedValue({
      response: { status: 429 }
    });

    const result = await submitToUniSMS(mockRecord);
    expect(result.status).toBe('unknown');
    expect(result.error).toContain('Rate limited (429)');
  });

  it('should return unknown on timeout', async () => {
    process.env.UNISMS_LIVE_SEND_ENABLED = 'true';
    axios.post.mockRejectedValue({
      code: 'ECONNABORTED'
    });

    const result = await submitToUniSMS(mockRecord);
    expect(result.status).toBe('unknown');
    expect(result.error).toBe('Request timed out');
  });

  it('should avoid resubmitting if providerRefId is already accepted/sent', async () => {
    process.env.UNISMS_LIVE_SEND_ENABLED = 'true';
    const recordWithRef = { ...mockRecord, providerRefId: 'existing_ref' };
    
    axios.get.mockResolvedValue({
      status: 200,
      data: { status: 'sent' }
    });

    const result = await submitToUniSMS(recordWithRef);
    expect(result).toEqual({ status: 'accepted', refId: 'existing_ref' });
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('should proceed to submit if providerRefId lookup says failed', async () => {
    process.env.UNISMS_LIVE_SEND_ENABLED = 'true';
    const recordWithRef = { ...mockRecord, providerRefId: 'failed_ref' };
    
    axios.get.mockResolvedValue({
      status: 200,
      data: { status: 'failed' }
    });
    axios.post.mockResolvedValue({
      status: 201,
      data: { message: { reference_id: 'new_ref' } }
    });

    const result = await submitToUniSMS(recordWithRef);
    expect(result).toEqual({ status: 'accepted', refId: 'new_ref' });
    expect(axios.post).toHaveBeenCalled();
  });
});
