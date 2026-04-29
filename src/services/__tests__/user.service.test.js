import { describe, it, expect, vi } from 'vitest';
import { updateUserProfile } from '../user.service';
import { db } from '../../firebaseConfig';

// Mocking firebase/database
vi.mock('../../firebaseConfig', () => ({
  db: {}
}));

vi.mock('firebase/database', () => ({
  ref: vi.fn(),
  update: vi.fn(),
  serverTimestamp: vi.fn(() => 'mocked-timestamp')
}));

describe('user.service.js', () => {
  it('should throw error if UID is missing', async () => {
    await expect(updateUserProfile(null, {})).rejects.toThrow();
  });
});