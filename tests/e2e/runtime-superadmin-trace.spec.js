import { test, expect } from "@playwright/test";

test("SuperAdmin Runtime Trace", async ({ page }) => {
  console.log("\n--- START RUNTIME TRACE: SuperAdmin ---");

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
    .fill(process.env.TEST_USER_SUPERADMIN_EMAIL);
  await page
    .locator('input[placeholder="••••••••"]')
    .fill(process.env.TEST_USER_SUPERADMIN_PASSWORD);
  await page.click('button:has-text("LOGIN NOW")');

  // Use page.evaluate to capture the internal application state from the window object if possible,
  // or just monitor the URL transitions.

  await page.waitForLoadState("networkidle");

  const finalUrl = page.url();
  console.log(`3. Final URL reached: ${finalUrl}`);

  // We want to know the sequence of URLs. We can use a request listener.
  // But for simplicity, let's just check the final result.

  if (finalUrl.includes("/dashboard")) {
    console.log("RESULT: LANDED ON DASHBOARD (Unexpected for SuperAdmin)");
  } else if (finalUrl.includes("/admin/user-management")) {
    console.log("RESULT: LANDED ON USER MANAGEMENT (Expected for SuperAdmin)");
  } else if (finalUrl.includes("/force-password-change")) {
    console.log("RESULT: LANDED ON FORCE PASSWORD CHANGE (Unexpected for SuperAdmin)");
  } else {
    console.log(`RESULT: LANDED ON UNKNOWN URL: ${finalUrl}`);
  }

  console.log("--- END RUNTIME TRACE: SuperAdmin ---\n");
});
