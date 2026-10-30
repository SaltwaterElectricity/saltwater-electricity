import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initFirebaseAdmin } from '../../api/_utils/firebase.js';

vi.mock('firebase-admin/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
  cert: vi.fn((config) => config),
}));
vi.mock('firebase-admin/auth', () => ({ getAuth: vi.fn() }));
vi.mock('firebase-admin/database', () => ({ getDatabase: vi.fn() }));

describe('Firebase E2E Isolation Guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.VERCEL_ENV;
    delete process.env.FIREBASE_PROJECT_ID;
    delete process.env.FIREBASE_CLIENT_EMAIL;
    delete process.env.FIREBASE_PRIVATE_KEY;
    delete process.env.FIREBASE_DATABASE_URL;
    delete process.env.E2E_MODE;
  });

  it('should allow staging project in Preview mode when E2E_MODE is false', () => {
    process.env.VERCEL_ENV = 'preview';
    process.env.FIREBASE_PROJECT_ID = 'saltwater-electricity-staging';
    process.env.FIREBASE_CLIENT_EMAIL = 'test@saltwater-electricity-staging.iam.gserviceaccount.com';
    process.env.FIREBASE_PRIVATE_KEY = 'test-key';
    process.env.FIREBASE_DATABASE_URL = 'https://saltwater-electricity-staging-default-rtdb.asia-southeast1.firebasedatabase.app';
    
    expect(() => initFirebaseAdmin()).not.toThrow();
  });

  it('should reject Production project ID in Preview mode when E2E_MODE is false', () => {
    process.env.VERCEL_ENV = 'preview';
    process.env.FIREBASE_PROJECT_ID = 'saltwater-electricity';
    process.env.FIREBASE_CLIENT_EMAIL = 'test@saltwater-electricity.iam.gserviceaccount.com';
    process.env.FIREBASE_PRIVATE_KEY = 'test-key';
    process.env.FIREBASE_DATABASE_URL = 'https://saltwater-electricity-default-rtdb.firebaseio.com';
    
    expect(() => initFirebaseAdmin()).toThrow("[SECURITY] E2E mode must use the 'saltwater-electricity-staging' project.");
  });

  it('should reject alternative E2E projects and enforce saltwater-electricity-staging', () => {
    process.env.VERCEL_ENV = 'preview';
    process.env.E2E_MODE = 'true';
    process.env.FIREBASE_PROJECT_ID = 'saltwater-electricity-e2e';
    process.env.FIREBASE_CLIENT_EMAIL = 'test@saltwater-electricity-e2e.iam.gserviceaccount.com';
    process.env.FIREBASE_PRIVATE_KEY = 'test-key';
    process.env.FIREBASE_DATABASE_URL = 'https://saltwater-electricity-e2e-default-rtdb.firebaseio.com';
    
    expect(() => initFirebaseAdmin()).toThrow("[SECURITY] E2E mode must use the 'saltwater-electricity-staging' project.");
  });

  it('should allow staging project in Preview mode when E2E_MODE is true', () => {
    process.env.VERCEL_ENV = 'preview';
    process.env.E2E_MODE = 'true';
    process.env.FIREBASE_PROJECT_ID = 'saltwater-electricity-staging';
    process.env.FIREBASE_CLIENT_EMAIL = 'test@saltwater-electricity-staging.iam.gserviceaccount.com';
    process.env.FIREBASE_PRIVATE_KEY = 'test-key';
    process.env.FIREBASE_DATABASE_URL = 'https://saltwater-electricity-staging-default-rtdb.asia-southeast1.firebasedatabase.app';
    
    expect(() => initFirebaseAdmin()).not.toThrow();
  });

  it('should reject Production project ID even in E2E mode', () => {
    process.env.VERCEL_ENV = 'preview';
    process.env.E2E_MODE = 'true';
    process.env.FIREBASE_PROJECT_ID = 'saltwater-electricity';
    process.env.FIREBASE_CLIENT_EMAIL = 'test@saltwater-electricity.iam.gserviceaccount.com';
    process.env.FIREBASE_PRIVATE_KEY = 'test-key';
    process.env.FIREBASE_DATABASE_URL = 'https://saltwater-electricity-default-rtdb.firebaseio.com';
    
    expect(() => initFirebaseAdmin()).toThrow("[SECURITY] E2E mode must use the 'saltwater-electricity-staging' project.");
  });

  it('should reject E2E mode in Production environment', () => {
    process.env.VERCEL_ENV = 'production';
    process.env.E2E_MODE = 'true';
    process.env.FIREBASE_PROJECT_ID = 'saltwater-electricity';
    process.env.FIREBASE_CLIENT_EMAIL = 'test@saltwater-electricity.iam.gserviceaccount.com';
    process.env.FIREBASE_PRIVATE_KEY = 'test-key';
    process.env.FIREBASE_DATABASE_URL = 'https://saltwater-electricity-default-rtdb.firebaseio.com';
    
    expect(() => initFirebaseAdmin()).toThrow("[SECURITY] E2E mode cannot be enabled in Production environment.");
  });

  it('should fail closed if credentials are missing', () => {
    process.env.VERCEL_ENV = 'production';
    process.env.FIREBASE_PROJECT_ID = 'saltwater-electricity';
    expect(() => initFirebaseAdmin()).toThrow("Missing Firebase Admin credentials");
  });
});
