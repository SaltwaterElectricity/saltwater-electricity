import { describe, it, expect, beforeEach, vi } from "vitest";
import generateOTP from "../generateOTP.js";

// Mock Firebase Admin
vi.mock("../_utils/firebase.js", () => ({
  initFirebaseAdmin: vi.fn(() => ({
    auth: {
      getUserByEmail: vi.fn((email) => {
        if (email === "exists@test.com") return Promise.resolve({ uid: "test-uid-123" });
        const err = new Error("User not found");
        err.code = "auth/user-not-found";
        return Promise.reject(err);
      }),
    },
    db: {
      ref: vi.fn(() => ({
        set: vi.fn().mockResolvedValue({}),
      })),
    },
  })),
}));

// Mock SendGrid
vi.mock("@sendgrid/mail", () => {
  return {
    default: {
      setApiKey: vi.fn(),
      send: vi.fn().mockResolvedValue([{ status: 202 }]),
    },
  };
});

describe("generateOTP Local Execution Trace", () => {
  let req, res;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SENDGRID_API_KEY = "SG.test-key";
    process.env.SENDGRID_SENDER_EMAIL = "test@test.com";

    res = {
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      end: vi.fn(),
    };
  });

  it("should trace execution for existing user", async () => {
    req = {
      method: "POST",
      body: { email: "exists@test.com" },
      headers: {},
    };

    await generateOTP(req, res);

    console.warn("Local Execution: Success");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should trace execution for non-existing user (EPP)", async () => {
    req = {
      method: "POST",
      body: { email: "nonexistent@test.com" },
      headers: {},
    };

    await generateOTP(req, res);

    console.warn("Local Execution (EPP): Success");
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
