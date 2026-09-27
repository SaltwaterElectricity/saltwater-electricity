import { test, expect } from "@playwright/test";

test("Auth Identity Deep Probe", async ({ page }) => {
  console.log("\n--- START AUTH IDENTITY DEEP PROBE ---");
  
  await page.route("**/*", async (route) => {
    const url = route.request().url();
    if (url.includes("saltwater-electricity-git-e8acf7-saltwaterelectricitys-projects.vercel.app")) {
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

  // We will use page.evaluate to check the window for any markers we can inject.
  // Since we can't easily inject code into the bundle without a rebuild, 
  // we'll rely on the console logs we already added to the source.

  console.log("Performing Login...");
  await page.locator('input[placeholder="name@example.com"]').fill(process.env.TEST_USER_SUPERADMIN_EMAIL);
  await page.locator('input[placeholder="••••••••"]').fill(process.env.TEST_USER_SUPERADMIN_PASSWORD);
  await page.click('button:has-text("LOGIN NOW")');

  // Wait for the auth chain to potentially execute
  await page.waitForTimeout(15000);

  const finalUrl = page.url();
  console.log(`Final URL: ${finalUrl}`);
  console.log("--- END AUTH IDENTITY DEEP PROBE ---\n");
});
