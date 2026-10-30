import { describe, it, expect, vi, beforeEach } from "vitest";
import { initFirebaseAdmin } from "../../api/_utils/firebase.js";
import { initializeApp } from "firebase-admin/app";

vi.mock("firebase-admin/app", () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
  cert: vi.fn((config) => config),
}));
vi.mock("firebase-admin/auth", () => ({ getAuth: vi.fn() }));
vi.mock("firebase-admin/database", () => ({ getDatabase: vi.fn() }));

describe("Firebase Private Key Normalization", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.FIREBASE_PROJECT_ID = "test-project";
    process.env.FIREBASE_CLIENT_EMAIL = "test@example.com";
    process.env.FIREBASE_DATABASE_URL = "https://test.firebaseio.com";
    process.env.VERCEL_ENV = "development";
  });

  it("should replace escaped \\n with actual newline characters", () => {
    process.env.FIREBASE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCA\\n-----END PRIVATE KEY-----";
    
    initFirebaseAdmin();
    
    const callArgs = vi.mocked(initializeApp).mock.calls[0][0];
    const privateKey = callArgs.credential.privateKey;
    
    expect(privateKey).toContain("\n");
    expect(privateKey).not.toContain("\\n");
  });

  it("should handle already-multiline private keys correctly", () => {
    const multilineKey = "-----BEGIN PRIVATE KEY-----\nLine1\nLine2\n-----END PRIVATE KEY-----";
    process.env.FIREBASE_PRIVATE_KEY = multilineKey;
    
    initFirebaseAdmin();
    
    const callArgs = vi.mocked(initializeApp).mock.calls[0][0];
    expect(callArgs.credential.privateKey).toBe(multilineKey);
  });

  it("should fail closed when credentials are missing", () => {
    delete process.env.FIREBASE_PRIVATE_KEY;
    
    expect(() => initFirebaseAdmin()).toThrow(/Missing Firebase Admin credentials/);
  });

  it("should fail closed when project ID is missing", () => {
    delete process.env.FIREBASE_PROJECT_ID;
    
    expect(() => initFirebaseAdmin()).toThrow(/Missing Firebase Admin credentials/);
  });
});
