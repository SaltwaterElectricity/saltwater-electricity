import { test, expect } from "@playwright/test";

test("Admin Runtime Trace", async ({ page }) => {
  console.log("\n--- START RUNTIME TRACE: Admin ---");

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

  console.log("1. Navigating to /login...");
  await page.goto("/login");

  console.log("2. Performing Login...");
  await page
    .locator('input[placeholder="name@example.com"]')
    .fill(process.env.TEST_USER_ADMIN_EMAIL);
  await page.locator('input[placeholder="••••••••"]').fill(process.env.TEST_USER_ADMIN_PASSWORD);
  await page.click('button:has-text("LOGIN NOW")');

  await page.waitForLoadState("networkidle");

  const finalUrl = page.url();
  console.log(`3. Final URL reached: ${finalUrl}`);

  if (finalUrl.includes("/force-password-change")) {
    console.log("RESULT: LANDED ON FORCE PASSWORD CHANGE (Expected for Admin)");
  } else if (finalUrl.includes("/dashboard")) {
    console.log("RESULT: LANDED ON DASHBOARD (Unexpected for Admin)");
  } else {
    console.log(`RESULT: LANDED ON UNKNOWN URL: ${finalUrl}`);
  }

  console.log("--- END RUNTIME TRACE: Admin ---\n");
});
