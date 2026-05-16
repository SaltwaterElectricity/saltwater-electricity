import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateEmail, validatePassword } from '../auth.service';
import { appError } from '../../utils/appError';

// Mocking firebaseConfig to avoid Env Var check
vi.mock('../../firebaseConfig', () => ({
  auth: {},
  db: {},
  default: {}
}));

describe('auth.service.js validation', () => {
  describe("validateEmail", () => {
    it("should throw error for invalid email formats", () => {
      expect(() => validateEmail("invalid-email")).toThrow(appError);
      expect(() => validateEmail("user@")).toThrow(appError);
    });

    it("should pass for valid email formats", () => {
      expect(() => validateEmail("test@example.com")).not.toThrow();
    });
  });

  describe("validatePassword", () => {
    it("should throw error for short passwords", () => {
      expect(() => validatePassword("12345")).toThrow(appError);
    });

    it("should throw error for missing special characters", () => {
      expect(() => validatePassword("Password123")).toThrow(appError);
    });

    it("should pass for valid passwords", () => {
      expect(() => validatePassword("Password@123")).not.toThrow();
    });
  });

  describe("resetUserPasswordWithOTP", () => {
    beforeEach(() => {
      vi.stubGlobal("fetch", vi.fn());
    });

    it("should call the backend API with correct parameters", async () => {
      const email = "test@example.com";
      const newPassword = "NewPassword@123";
      const otp = "123456";

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const { resetUserPasswordWithOTP } = await import("../auth.service");
      await resetUserPasswordWithOTP(email, newPassword, otp);

      expect(fetch).toHaveBeenCalledWith(
        "/api/resetPassword",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ email, newPassword, otp }),
        })
      );
    });

    it("should throw appError when API returns an error", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: "Invalid OTP", code: "auth/invalid-otp" }),
      });

      const { resetUserPasswordWithOTP } = await import("../auth.service");
      await expect(resetUserPasswordWithOTP("e", "p", "o")).rejects.toThrow(appError);
    });
  });
});
