import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.API_BASE_URL || "http://localhost:5173",
    extraHTTPHeaders: {
      // The bypass token is sent only to the Vercel Preview origin
      // We use a function or a proxy to handle this if needed, but Playwright's
      // extraHTTPHeaders is global. To avoid sending it to 3rd parties,
      // we will instead use page.setExtraHTTPHeaders in the test or a hook.
    },
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  globalSetup: './tests/global-setup.cjs',
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
