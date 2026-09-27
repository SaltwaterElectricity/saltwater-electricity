import { test, expect } from "@playwright/test";

test("Auth Instance Identity and Listener Probe", async ({ page }) => {
  console.log("\n--- START AUTH INSTANCE IDENTITY PROBE ---");

  await page.route("**/*", async (route) => {
    const url = route.request().url();
    if (
      url.includes("saltwater-electricity-git-e8acf7-saltwaterelectricitys-projects.vercel.app")
    ) {
      const headers = {
        ...route.request().headers(),
        "x-vercel-protection-bypass": process.env.VERCEL_PROTECTION_BYPASS_TOKEN || "",
      };
      await route.continue({ headers });
    } else {
      await route.continue();
    }
  });

  await page.goto("/login");

  // 1. Probe the Auth instance identity from the browser
  const authIdentity = await page.evaluate(() => {
    // We need to access the auth instance.
    // Since it's not on window, we'll try to find it via a temporary script or by checking the exported modules if we had a way.
    // Instead, we'll use the existing instrumentation markers.
    return "Manual check of console logs required";
  });
  console.log(`Auth Identity Probe: ${authIdentity}`);

  // 2. Perform Login
  console.log("Submitting Login...");
  await page
    .locator('input[placeholder="name@example.com"]')
    .fill(process.env.TEST_USER_SUPERADMIN_EMAIL);
  await page
    .locator('input[placeholder="••••••••"]')
    .fill(process.env.TEST_USER_SUPERADMIN_PASSWORD);
  await page.click('button:has-text("LOGIN NOW")');

  // 3. Capture logs for the next 20 seconds
  console.log("Capturing auth markers...");

  // We'll use a timeout and just let the logs flow.
  await page.waitForTimeout(20000);

  const finalUrl = page.url();
  console.log(`Final URL: ${finalUrl}`);
  console.log("--- END AUTH INSTANCE IDENTITY PROBE ---\n");
});
