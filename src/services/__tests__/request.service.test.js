import { describe, it, expect, vi } from "vitest";
import { createDeviceRequest } from "../request.service";
import { auth } from "../../firebaseConfig";

// Mocking firebase/database
vi.mock("../../firebaseConfig", () => ({
  db: {},
  auth: {
    currentUser: { uid: "user123" },
  },
}));

vi.mock("../auth.service", () => ({
  getUserClaims: vi.fn(() => Promise.resolve({ admin: false })),
}));

vi.mock("../audit.service", () => ({
  logActivity: vi.fn(() => Promise.resolve()),
}));

vi.mock("firebase/database", () => ({
  ref: vi.fn(),
  push: vi.fn(() => Promise.resolve({ key: "mock-request-id" })),
  serverTimestamp: vi.fn(() => "mocked-timestamp"),
  update: vi.fn(() => Promise.resolve()),
}));

describe("request.service.js", () => {
  it("should throw error if userId is missing (no auth)", async () => {
    // Temporarily mock auth.currentUser as null
    const originalUser = auth.currentUser;
    auth.currentUser = null;

    await expect(
      createDeviceRequest({ requestType: "new_installation", deviceName: "Test Device" })
    ).rejects.toThrow(/You must be logged in to submit a request/);

    auth.currentUser = originalUser;
  });

  it("should throw error if deviceData is incomplete", async () => {
    await expect(createDeviceRequest({ requestType: "new_installation" })).rejects.toThrow(
      /Incomplete information/
    );

    await expect(createDeviceRequest({ deviceName: "Test Device" })).rejects.toThrow(
      /Incomplete information/
    );
  });

  it("should successfully create a request and return requestId", async () => {
    const result = await createDeviceRequest({
      requestType: "new_installation",
      deviceName: "Test Device",
    });

    expect(result).toEqual({
      success: true,
      requestId: "mock-request-id",
    });
  });

  it("should wrap Firebase errors in appError", async () => {
    const { push } = await import("firebase/database");
    push.mockRejectedValueOnce(new Error("Firebase error"));

    await expect(
      createDeviceRequest({
        requestType: "new_installation",
        deviceName: "Test Device",
      })
    ).rejects.toThrow(/The request service is currently offline/);
  });
});
