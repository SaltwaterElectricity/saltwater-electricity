import { test, expect } from "@playwright/test";

test.describe("Full Staging Authentication & Authorization Suite", () => {
  const TEST_USERS = {
    superAdmin: {
      email: process.env.TEST_USER_SUPERADMIN_EMAIL,
      password: process.env.TEST_USER_SUPERADMIN_PASSWORD,
      expectedRole: "superAdmin",
      expectedRoute: "/admin/user-management",
      requiresPasswordChange: true,
      tempPassword: "S3cur3!Pass2026_Super",
    },
    admin: {
      email: process.env.TEST_USER_ADMIN_EMAIL,
      password: process.env.TEST_USER_ADMIN_PASSWORD,
      expectedRole: "admin",
      expectedRoute: "/dashboard",
      requiresPasswordChange: true,
      tempPassword: "S3cur3!Pass2026_Admin",
    },
    residentA: {
      email: process.env.TEST_USER_RESIDENT_A_EMAIL,
      password: process.env.TEST_USER_RESIDENT_A_PASSWORD,
      expectedRole: "resident",
      expectedRoute: "/dashboard",
      requiresPasswordChange: true,
      tempPassword: "S3cur3!Pass2026_ResA",
    },
    residentB: {
      email: process.env.TEST_USER_RESIDENT_B_EMAIL,
      password: process.env.TEST_USER_RESIDENT_B_PASSWORD,
      expectedRole: "resident",
      expectedRoute: "/dashboard",
      requiresPasswordChange: true,
      tempPassword: "S3cur3!Pass2026_ResB",
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

  async function performLogin(page, email, password) {
    await page.goto("/login");
    await page.locator('input[placeholder="name@example.com"]').fill(email);
    await page.locator('input[placeholder="••••••••"]').fill(password);
    await page.click('button:has-text("LOGIN NOW")');
  }

  test.describe("Identity-Specific Flows", () => {
    for (const [roleKey, user] of Object.entries(TEST_USERS)) {
      test(`Flow for ${roleKey}: ${user.email}`, async ({ page }) => {
        console.log(`🚀 Testing flow for ${roleKey}...`);

        const rtdbRequestPromise = page
          .waitForRequest((request) => request.url().includes("firebasedatabase.app"), {
            timeout: 10000,
          })
          .catch(() => null);

        await performLogin(page, user.email, user.password);

        if (user.requiresPasswordChange) {
          await expect(page).toHaveURL(/\/force-password-change/, { timeout: 15000 });

          await page.locator('input[name="newPassword"]').fill(user.tempPassword);
          await page.locator('input[name="confirmPassword"]').fill(user.tempPassword);
          await page.click('button:has-text("Secure Account & Continue")');

          // INTENTIONAL: authenticated users are redirected to dashboard via RootRedirect
          await expect(page).toHaveURL(user.expectedRoute, { timeout: 15000 });
          console.log(`✅ ${roleKey} redirected to ${user.expectedRoute} after password change.`);

          const logoutBtn = page.locator("text=Logout");
          if (await logoutBtn.isVisible()) {
            await logoutBtn.click();
          }
          await expect(page).toHaveURL(/\/login|\//, { timeout: 10000 });

          await performLogin(page, user.email, user.tempPassword);
          await expect(page).toHaveURL(user.expectedRoute, { timeout: 15000 });
          console.log(`✅ ${roleKey} authenticated with new password.`);

          const finalLogout = page.locator("text=Logout");
          if (await finalLogout.isVisible()) {
            await finalLogout.click();
          }
          await expect(page).toHaveURL(/\/login|\//, { timeout: 10000 });

          await performLogin(page, user.email, user.password);
          await expect(page.locator("text=Invalid email or password")).toBeVisible({
            timeout: 10000,
          });
          console.log(`✅ ${roleKey}: Old password rejected.`);
        } else {
          await expect(page).toHaveURL(user.expectedRoute, { timeout: 15000 });
          console.log(`✅ ${roleKey} redirected to expected route: ${user.expectedRoute}`);
        }

        const dbRequest = await rtdbRequestPromise;
        if (dbRequest) {
          expect(dbRequest.url()).toContain("saltwater-electricity-staging");
        }

        const finalLogout = page.locator("text=Logout");
        if (await finalLogout.isVisible()) {
          await finalLogout.click();
          await expect(page).toHaveURL(/\/login|\//, { timeout: 10000 });
        }
      });
    }
  });

  test("Cross-role Authorization: Resident cannot access Admin routes", async ({ page }) => {
    console.log("🚀 Testing Cross-role Isolation: Resident -> Admin...");
    await performLogin(page, TEST_USERS.residentA.email, TEST_USERS.residentA.password);

    if (TEST_USERS.residentA.requiresPasswordChange) {
      await page.locator('input[name="newPassword"]').fill(TEST_USERS.residentA.tempPassword);
      await page.locator('input[name="confirmPassword"]').fill(TEST_USERS.residentA.tempPassword);
      await page.click('button:has-text("Secure Account & Continue")');
    }

    await page.goto("/admin/user-management");
    // Verify that the PrivateRoute returns <NotFound />
    await expect(page.locator("text=Page Not Found")).toBeVisible({ timeout: 10000 });
    console.log("✅ Resident blocked from Admin route (NotFound rendered).");

    const logoutBtn = page.locator("text=Logout");
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
    }
  });

  test("Cross-role Authorization: Admin cannot access SuperAdmin routes", async ({ page }) => {
    console.log("🚀 Testing Cross-role Isolation: Admin -> SuperAdmin...");
    await performLogin(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    if (TEST_USERS.admin.requiresPasswordChange) {
      await page.locator('input[name="newPassword"]').fill(TEST_USERS.admin.tempPassword);
      await page.locator('input[name="confirmPassword"]').fill(TEST_USERS.admin.tempPassword);
      await page.click('button:has-text("Secure Account & Continue")');
    }

    await page.goto("/admin/register-staff");
    await expect(page.locator("text=Page Not Found")).toBeVisible({ timeout: 10000 });
    console.log("✅ Admin blocked from SuperAdmin route (NotFound rendered).");

    const logoutBtn = page.locator("text=Logout");
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
    }
  });
});
