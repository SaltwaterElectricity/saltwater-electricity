import { test, expect } from "@playwright/test";

test.describe("Staging RBAC Forensic Diagnostics", () => {
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

  async function performLogin(page, email, password) {
    await page.goto("/login");
    await page.locator('input[placeholder="name@example.com"]').fill(email);
    await page.locator('input[placeholder="••••••••"]').fill(password);
    await page.click('button:has-text("LOGIN NOW")');
  }

  for (const [roleKey, user] of Object.entries(TEST_USERS)) {
    test(`Diagnostics for ${roleKey}: ${user.email}`, async ({ page }) => {
      console.log(`\n--- START DIAGNOSTICS: ${roleKey} ---`);

      await performLogin(page, user.email, user.password);

      // 1. Capture Runtime Identity
      const identity = await page.evaluate(() => {
        // We try to extract data from the window if we've exposed it,
        // or we probe the DOM for indicators.
        // Since we can't easily access React context, we'll look for
        // a way to dump the current auth state.
        return {
          url: window.location.href,
          localStorage: JSON.stringify(localStorage),
          sessionStorage: JSON.stringify(sessionStorage),
        };
      });
      console.log(`Runtime URL: ${identity.url}`);

      // 2. Probe Protected Routes
      const routesToTest = [
        { path: "/admin/user-management", name: "User Management" },
        { path: "/admin/register-staff", name: "Staff Registration" },
      ];

      for (const route of routesToTest) {
        await page.goto(route.path);
        const finalUrl = page.url();
        const content = await page.content();

        // Check if it's a 404 (NotFound component) or the actual page
        const isNotFound = content.includes("Page Not Found") || finalUrl.includes("/not-found");
        const isDashboard = finalUrl.includes("/dashboard");
        const isLogin = finalUrl.includes("/login");

        console.log(`Route ${route.path} (${route.name}):`);
        console.log(`  - Final URL: ${finalUrl}`);
        console.log(
          `  - Result: ${isNotFound ? "NOT_FOUND" : isDashboard ? "DASHBOARD" : isLogin ? "LOGIN" : "RENDERED"}`
        );

        if (!isNotFound && !isDashboard && !isLogin) {
          // If it actually rendered, let's see if it's a real admin page
          const hasAdminHeader = await page
            .locator('h1:has-text("User Management"), h2:has-text("Protect Your Account")')
            .isVisible()
            .catch(() => false);
          console.log(`  - Protected UI Rendered: ${hasAdminHeader}`);
        }
      }

      console.log(`--- END DIAGNOSTICS: ${roleKey} ---\n`);
    });
  }
});
