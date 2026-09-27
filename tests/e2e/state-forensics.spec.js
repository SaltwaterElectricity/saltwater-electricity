import { test, expect } from "@playwright/test";

test.describe("Staging State Forensics", () => {
  const TEST_USERS = {
    superAdmin: {
      email: process.env.TEST_USER_SUPERADMIN_EMAIL,
      password: process.env.TEST_USER_SUPERADMIN_PASSWORD,
    },
    admin: {
      email: process.env.TEST_USER_ADMIN_EMAIL,
      password: process.env.TEST_USER_ADMIN_PASSWORD,
    },
    residentA: {
      email: process.env.TEST_USER_RESIDENT_A_EMAIL,
      password: process.env.TEST_USER_RESIDENT_A_PASSWORD,
    },
    residentB: {
      email: process.env.TEST_USER_RESIDENT_B_EMAIL,
      password: process.env.TEST_USER_RESIDENT_B_PASSWORD,
    },
  };

  test.beforeEach(async ({ page }) => {
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
  });

  for (const [roleKey, user] of Object.entries(TEST_USERS)) {
    test(`State Check: ${roleKey}`, async ({ page }) => {
      console.log(`\n--- STATE CHECK: ${roleKey} (${user.email}) ---`);

      await page.goto("/login");
      await page.locator('input[placeholder="name@example.com"]').fill(user.email);
      await page.locator('input[placeholder="••••••••"]').fill(user.password);
      await page.click('button:has-text("LOGIN NOW")');

      // Wait for redirect/settlement
      await page.waitForLoadState("networkidle");

      const finalUrl = page.url();
      console.log(`Final URL: ${finalUrl}`);

      // Try to capture runtime identity if possible via console log or page evaluation
      // Note: Since we don't have a debug endpoint, we look at the URL.
      if (finalUrl.includes("/force-password-change")) {
        console.log("Status: REQUIRES_PASSWORD_CHANGE");
      } else if (finalUrl.includes("/dashboard") || finalUrl.includes("/admin")) {
        console.log("Status: AUTHENTICATED");
      } else if (finalUrl.includes("/login")) {
        console.log("Status: LOGIN_PAGE (Possible Auth Failure or Redirect Loop)");
      } else {
        console.log(`Status: UNKNOWN (${finalUrl})`);
      }

      console.log(`--- END STATE CHECK: ${roleKey} ---\n`);
    });
  }
});
