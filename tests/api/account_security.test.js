import { vi, describe, it, expect, beforeEach } from "vitest";
import resetPassword from "../../api/../api/resetPassword.js";
import sendProvisioningEmail from "../../api/../api/sendProvisioningEmail.js";
import { initFirebaseAdmin } from "../../api/../api/_utils/firebase.js";

// Mock Firebase Admin
vi.mock("../../api/../api/_utils/firebase.js", () => ({
  initFirebaseAdmin: vi.fn(),
}));

// Mock Response Utils
vi.mock("../../api/../api/_utils/response.js", () => ({
  sendSuccess: vi.fn((res, data) => {
    res.status(200);
    res.json(data);
    return { success: true };
  }),
  sendError: vi.fn((res, msg, status, code) => {
    res.status(status);
    res.json({ error: msg, code });
    return { success: false };
  }),
  handleOptions: vi.fn(() => false),
}));

// Mock Environment for SendGrid
vi.stubEnv('SENDGRID_API_KEY', 'mock-key');
vi.stubEnv('SENDGRID_SENDER_EMAIL', 'mock@test.com');

// Mock SendGrid
vi.mock("@sendgrid/mail", () => ({
  default: {
    setApiKey: vi.fn(),
    send: vi.fn().mockResolvedValue([{ status: 202 }]),
  },
}));

describe("Account Security Regression Tests", () => {
  let req, res, mockDb, mockAuth;

  beforeEach(() => {
    vi.clearAllMocks();

    mockDb = {
      ref: vi.fn((_path) => ({
        once: vi.fn(),
        get: vi.fn(),
        update: vi.fn().mockResolvedValue({}),
        transaction: vi.fn(),
      })),
    };

    mockAuth = {
      verifyIdToken: vi.fn(),
      updateUser: vi.fn().mockResolvedValue({}),
    };

    initFirebaseAdmin.mockReturnValue({ db: mockDb, auth: mockAuth });

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn(),
    };
  });

  describe("enforceAccountSecurity via resetPassword", () => {
    it("should block requests with missing auth header", async () => {
      req = { method: "POST", headers: {}, body: {} };
      await resetPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it("should block disabled accounts", async () => {
      req = { 
        method: "POST", 
        headers: { authorization: "Bearer valid-token" }, 
        body: { transactionToken: "t1", newPassword: "password123" } 
      };
      mockAuth.verifyIdToken.mockResolvedValue({ uid: "user123" });
      mockDb.ref.mockImplementation((path) => {
        if (path.includes("accounts/user123")) {
          return { once: vi.fn().mockResolvedValue({ val: () => ({ status: "disabled" }) }) };
        }
        return { once: vi.fn() };
      });

      await resetPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it("should allow valid active accounts to proceed to OTP check", async () => {
      req = { 
        method: "POST", 
        headers: { authorization: "Bearer valid-token" }, 
        body: { transactionToken: "valid-token", newPassword: "password123" } 
      };
      mockAuth.verifyIdToken.mockResolvedValue({ uid: "user123" });
      mockDb.ref.mockImplementation((path) => {
        if (path.includes("accounts/user123")) {
          return { once: vi.fn().mockResolvedValue({ val: () => ({ status: "active" }) }) };
        }
        if (path.includes("otp-requests/valid-token")) {
          return { transaction: vi.fn().mockResolvedValue({ committed: false }) };
        }
        return { once: vi.fn() };
      });

      await resetPassword(req, res);
      // Should reach the OTP transaction check and fail there (403) rather than the security gate (401/403)
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe("enforceAccountSecurity via sendProvisioningEmail", () => {
    it("should block non-admin users", async () => {
      req = { 
        method: "POST", 
        headers: { authorization: "Bearer valid-token" }, 
        body: { to: "user@test.com", subject: "Hello" } 
      };
      mockAuth.verifyIdToken.mockResolvedValue({ uid: "user123" });
      mockDb.ref.mockImplementation((path) => {
        if (path.includes("accounts/user123")) {
          return { once: vi.fn().mockResolvedValue({ val: () => ({ status: "active" }) }) };
        }
        if (path.includes("roles/user123")) {
          return { get: vi.fn().mockResolvedValue({ exists: () => true, val: () => ({ role: "resident" }) }) };
        }
        return { once: vi.fn() };
      });

      await sendProvisioningEmail(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it("should allow admin users to send emails", async () => {
      req = { 
        method: "POST", 
        headers: { authorization: "Bearer valid-token" }, 
        body: { to: "user@test.com", subject: "Hello", templateType: "otp", templateData: { otpCode: "123456" } } 
      };
      mockAuth.verifyIdToken.mockResolvedValue({ uid: "admin123" });
      mockDb.ref.mockImplementation((path) => {
        if (path.includes("accounts/admin123")) {
          return { once: vi.fn().mockResolvedValue({ val: () => ({ status: "active" }) }) };
        }
        if (path.includes("roles/admin123")) {
          return { get: vi.fn().mockResolvedValue({ exists: () => true, val: () => ({ role: "admin" }) }) };
        }
        return { once: vi.fn() };
      });

      await sendProvisioningEmail(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
