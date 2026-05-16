import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateOTP, verifyOTP } from "../otp.service";

describe("otp.service.js", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  describe("generateOTP", () => {
    it("should call the generateOTP API", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await generateOTP(null, "test@example.com");

      expect(fetch).toHaveBeenCalledWith(
        "/api/generateOTP",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ email: "test@example.com" }),
        })
      );
    });
  });

  describe("verifyOTP", () => {
    it("should call the verifyOTP API", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ verified: true, email: "test@example.com" }),
      });

      const result = await verifyOTP("trackingId", "123456");

      expect(fetch).toHaveBeenCalledWith(
        "/api/verifyOTP",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ trackingId: "trackingId", code: "123456", shouldDelete: false }),
        })
      );
      expect(result.verified).toBe(true);
    });
  });
});
