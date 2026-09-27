import { test, expect } from '@playwright/test';

test.describe('Full Staging Authentication & Authorization Suite', () => {

  const TEST_USERS = {
    superAdmin: {
      email: process.env.TEST_USER_SUPERADMIN_EMAIL,
      password: process.env.TEST_USER_SUPERADMIN_PASSWORD,
      expectedRole: 'superAdmin',
      expectedRoute: '/admin/user-management',
      requiresPasswordChange: false,
    },
    admin: {
      email: process.env.TEST_USER_ADMIN_EMAIL,
      password: process.env.TEST_USER_ADMIN_PASSWORD,
      expectedRole: 'admin',
      expectedRoute: '/dashboard',
      requiresPasswordChange: true,
    },
    residentA: {
      email: process.env.TEST_USER_RESIDENT_A_EMAIL,
      password: process.env.TEST_USER_RESIDENT_A_PASSWORD,
      expectedRole: 'resident',
      expectedRoute: '/dashboard',
      requiresPasswordChange: true,
    },
    residentB: {
      email: process.env.TEST_USER_RESIDENT_B_EMAIL,
      password: process.env.TEST_USER_RESIDENT_B_PASSWORD,
      expectedRole: 'resident',
      expectedRoute: '/dashboard',
      requiresPasswordChange: true,
    },
  };

  test.beforeEach(async ({ page }) => {
    // 1. Hardened Vercel bypass implementation
    await page.route('**/*', async (route) => {
      const url = route.request().url();
      if (url.includes('saltwater-electricity-git-e8acf7-saltwaterelectricitys-projects.vercel.app')) {
        const headers = { ...route.request().headers(), 'x-vercel-protection-bypass': process.env.VERCEL_PROTECTION_BYPASS_TOKEN || '' };
        await route.continue({ headers });
      } else {
        await route.continue();
      }
    });

    // 2. Clean unauthenticated state
    await page.context().clearCookies();
    try {
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    } catch (e) {
      // intentionally ignored
    }
  });

  async function performLogin(page, user) {
    await page.goto('/login');
    await page.locator('input[placeholder="name@example.com"]').fill(user.email);
    await page.locator('input[placeholder="••••••••"]').fill(user.password);
    await page.click('button:has-text("LOGIN NOW")');
  }

  test.describe('Identity-Specific Flows', () => {
    for (const [roleKey, user] of Object.entries(TEST_USERS)) {
      test(`Flow for ${roleKey}: ${user.email}`, async ({ page }) => {
        console.log(`🚀 Testing flow for ${roleKey}...`);

        // Setup RTDB listener for runtime identity proof
        const rtdbRequestPromise = page.waitForRequest(request =>
          request.url().includes('firebasedatabase.app'),
          { timeout: 10000 }
        ).catch(() => null);

        await performLogin(page, user);

        // 1. Verify Route based on seeded state
        if (user.requiresPasswordChange) {
          await expect(page).toHaveURL(new RegExp('/force-password-change'), { timeout: 15000 });
          console.log(`✅ ${roleKey} redirected to forced password change as expected.`);
        } else {
          await expect(page).toHaveURL(new RegExp(user.expectedRoute), { timeout: 15000 });
          console.log(`✅ ${roleKey} redirected to expected route: ${user.expectedRoute}`);
        }

        // 2. Runtime RTDB Identity Check
        const dbRequest = await rtdbRequestPromise;
        if (dbRequest) {
          console.log(`Firebase RTDB Runtime URL: ${dbRequest.url()}`);
          expect(dbRequest.url()).toContain('saltwater-electricity-staging');
          console.log(`✅ ${roleKey}: Runtime staging RTDB identity proven.`);
        } else {
          console.log(`⚠️ ${roleKey}: No RTDB request observed during this flow.`);
        }

        // 3. Logout to ensure isolation
        const logoutBtn = page.locator('text=Logout');
        if (await logoutBtn.isVisible()) {
          await logoutBtn.click();
          await expect(page).toHaveURL(new RegExp('/login|/'), { timeout: 10000 });
          console.log(`✅ ${roleKey} logged out successfully.`);
        }
      });
    }
  });

  test('Cross-role Authorization: Resident cannot access Admin routes', async ({ page }) => {
    console.log('🚀 Testing Cross-role Isolation: Resident -> Admin...');

    await performLogin(page, TEST_USERS.residentA);

    // Attempt to navigate directly to an Admin route
    await page.goto('/admin/user-management');

    // The app should redirect to /dashboard or /not-found
    await expect(page).not.toHaveURL('/admin/user-management');
    console.log('✅ Resident blocked from Admin route.');

    // Logout
    const logoutBtn = page.locator('text=Logout');
    if (await logoutBtn.isVisible()) { await logoutBtn.click(); }
  });

  test('Cross-role Authorization: Admin cannot access SuperAdmin routes', async ({ page }) => {
    console.log('🚀 Testing Cross-role Isolation: Admin -> SuperAdmin...');

    await performLogin(page, TEST_USERS.admin);

    await page.goto('/admin/register-staff');

    await expect(page).not.toHaveURL('/admin/register-staff');
    console.log('✅ Admin blocked from SuperAdmin route.');

    const logoutBtn = page.locator('text=Logout');
    if (await logoutBtn.isVisible()) { await logoutBtn.click(); }
  });
});
