import { test, expect } from "@playwright/test";

test("SuperAdmin Redirect Proof", async ({ page }) => {
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
  await page
    .locator('input[placeholder="name@example.com"]')
    .fill(process.env.TEST_USER_SUPERADMIN_EMAIL);
  await page
    .locator('input[placeholder="••••••••"]')
    .fill(process.env.TEST_USER_SUPERADMIN_PASSWORD);
  await page.click('button:has-text("LOGIN NOW")');

  // We expect them to be at /admin/user-management
  await expect(page).toHaveURL(/\/admin\/user-management/, { timeout: 20000 });
  console.log("✅ SuperAdmin successfully redirected to /admin/user-management");
});
