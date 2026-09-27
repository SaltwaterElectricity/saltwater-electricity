import { test, expect } from '@playwright/test';

test.describe('Deep Auth & Routing Diagnosis', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/*', async (route) => {
      const url = route.request().url();
      if (url.includes('saltwater-electricity-git-e8acf7-saltwaterelectricitys-projects.vercel.app')) {
        const headers = { ...route.request().headers(), 'x-vercel-protection-bypass': process.env.VERCEL_PROTECTION_BYPASS_TOKEN || '' };
        await route.continue({ headers });
      } else {
        await route.continue();
      }
    });
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

  test('diagnose auth flow and failures', async ({ page }) => {
    const logs = [];
    page.on('console', msg => logs.push(`[CONSOLE] ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', err => logs.push(`[PAGE_ERROR] ${err.message}`));

    console.log('\n--- 1. Root Page Initial State ---');
    await page.goto('/', { waitUntil: 'networkidle' });
    console.log(`URL: ${page.url()}`);
    console.log(`Title: ${await page.title()}`);
    console.log(`Body: ${await page.innerHTML('body').then(h => h.substring(0, 500))}`);

    console.log('\n--- 2. Attempting Login ---');
    const loginRes = await page.goto('/login', { waitUntil: 'domcontentloaded' });
    if (loginRes.status() === 404) {
      console.log('Direct /login is still 404. Using root path to enter login flow.');
      await page.goto('/');
      const loginBtn = page.locator('text=Login Now');
      if (await loginBtn.isVisible()) {
        await loginBtn.click();
        await page.waitForURL('**/login', { timeout: 10000 });
      } else {
        console.log('Login Now button not found on root');
        return;
      }
    }

    await page.locator('input[placeholder="name@example.com"]').fill(process.env.TEST_USER_SUPERADMIN_EMAIL);
    await page.locator('input[placeholder="••••••••"]').fill(process.env.TEST_USER_SUPERADMIN_PASSWORD);
    
    const authRequestPromise = page.waitForRequest(req => req.url().includes('identitytoolkit.googleapis.com'), { timeout: 15000 });
    await page.click('button:has-text("LOGIN NOW")');
    
    const authReq = await authRequestPromise;
    const authRes = await authReq.response();
    console.log(`Firebase Auth Status: ${authRes?.status()}`);
    console.log(`Firebase Auth Body: ${await authRes?.text()}`);

    console.log('\n--- Final Console Logs ---');
    logs.forEach(l => console.log(l));
  });
});
