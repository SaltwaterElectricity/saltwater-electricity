import { describe, it, expect, vi } from "vitest";
import { subscribeToLatestReading, getHistoricalLogs } from "../reading.service";

// Mocking firebase/database and firebaseConfig
vi.mock("../../firebaseConfig", () => ({
  db: {},
  auth: {
    currentUser: { uid: "test-user-id" },
  },
}));

vi.mock("../auth.service", () => ({
  getUserClaims: vi.fn(() => Promise.resolve({ admin: false })),
}));

vi.mock("firebase/database", () => ({
  ref: vi.fn(),
  onValue: vi.fn(),
  get: vi.fn(),
  query: vi.fn(),
  limitToLast: vi.fn(),
  orderByKey: vi.fn(),
}));

describe("reading.service.js", () => {
  describe("Data Transformation (Internal logic via exported methods)", () => {
    it("should format decimals correctly for latest readings", async () => {
      const { onValue, get } = await import("firebase/database");

      // Mock verifyDeviceAccess success (first get call)
      get.mockResolvedValueOnce({
        exists: () => true,
        val: () => ({ userId: "test-user-id" }),
      });

      const mockSnapshot = {
        val: () => ({
          voltage: 4.12345,
          tds_ppm: 345.678,
          bulb_ma: 12.3456,
          device_id: "TEST_ID",
        }),
      };

      // Trigger the success callback
      onValue.mockImplementationOnce((ref, successCb) => {
        // We need to wait a tick for the async verifyDeviceAccess to finish
        setTimeout(() => successCb(mockSnapshot), 0);
        return vi.fn(); // Unsubscribe
      });

      const onSuccess = vi.fn();
      subscribeToLatestReading("TEST_ID", onSuccess, vi.fn());

      // Wait for the async call to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          voltage: 4.12,
          tds_ppm: 345.7,
          bulb_ma: 12.35,
        })
      );
    });
  });

  describe("Error Handling", () => {
    it("should throw appError when deviceId is missing in subscription", () => {
      expect(() => subscribeToLatestReading(null)).toThrow(/A valid Device identifier is required/);
    });

    it("should wrap Firebase errors in appError for historical logs", async () => {
      const { get } = await import("firebase/database");

      // 1. Mock verifyDeviceAccess success
      get.mockResolvedValueOnce({
        exists: () => true,
        val: () => ({ userId: "test-user-id" }),
      });

      // 2. Mock actual historical logs fetch failure
      get.mockRejectedValueOnce(new Error("Firebase failed"));

      await expect(getHistoricalLogs("TEST_ID")).rejects.toThrow(
        /historical data service is currently unavailable/
      );
    });
  });
});
