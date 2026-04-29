import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword } from '../auth.service';
import { appError } from '../../utils/appError';

describe('auth.service.js validation', () => {
  describe('validateEmail', () => {
    it('should throw error for invalid email formats', () => {
      expect(() => validateEmail('invalid-email')).toThrow(appError);
      expect(() => validateEmail('user@')).toThrow(appError);
    });

    it('should pass for valid email formats', () => {
      expect(() => validateEmail('test@example.com')).not.toThrow();
    });
  });

  describe('validatePassword', () => {
    it('should throw error for short passwords', () => {
      expect(() => validatePassword('12345')).toThrow(appError);
    });

    it('should throw error for missing special characters', () => {
      expect(() => validatePassword('Password123')).toThrow(appError);
    });

    it('should pass for valid passwords', () => {
      expect(() => validatePassword('Password@123')).not.toThrow();
    });
  });
});