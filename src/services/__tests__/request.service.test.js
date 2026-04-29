import { describe, it, expect, vi } from 'vitest';
import { createDeviceRequest } from '../request.service';

// Mocking firebase/database
vi.mock('../../firebaseConfig', () => ({
  db: {}
}));

vi.mock('firebase/database', () => ({
  ref: vi.fn(),
  push: vi.fn(() => Promise.resolve({ key: 'mock-request-id' })),
  serverTimestamp: vi.fn(() => 'mocked-timestamp')
}));

describe('request.service.js', () => {
  it('should throw error if userId is missing', async () => {
    await expect(createDeviceRequest(null, { requestType: 'new_installation', deviceName: 'Test Device' }))
      .rejects.toThrow(/User identification is required/);
  });

  it('should throw error if deviceData is incomplete', async () => {
    await expect(createDeviceRequest('user123', { requestType: 'new_installation' }))
      .rejects.toThrow(/Incomplete request data/);
    
    await expect(createDeviceRequest('user123', { deviceName: 'Test Device' }))
      .rejects.toThrow(/Incomplete request data/);
  });

  it('should successfully create a request and return requestId', async () => {
    const result = await createDeviceRequest('user123', { 
      requestType: 'new_installation', 
      deviceName: 'Test Device' 
    });

    expect(result).toEqual({
      success: true,
      requestId: 'mock-request-id'
    });
  });

  it('should wrap Firebase errors in appError', async () => {
    const { push } = await import('firebase/database');
    push.mockRejectedValueOnce(new Error('Firebase error'));

    await expect(createDeviceRequest('user123', { 
      requestType: 'new_installation', 
      deviceName: 'Test Device' 
    })).rejects.toThrow(/The request service is currently unavailable/);
  });
});
