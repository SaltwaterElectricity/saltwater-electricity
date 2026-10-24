const { chromium } = require('playwright');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.test' });

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('--- Phase 1: Root Accessibility ---');
    const rootResponse = await page.goto('https://saltwater-electricity.vercel.app/');
    console.log(`Root Status: ${rootResponse.status()}`);
    console.log(`Root Title: ${await page.title()}`);
    console.log(`Root URL: ${page.url()}`);

    console.log('\n--- Phase 2: Client-Side Navigation to /login ---');
    // Try to find any login-related link or button
    const loginLink = page.locator('a[href*="/login"], button:has-text("Login"), button:has-text("LOGIN"), a:has-text("Login")').first();
    
    if (await loginLink.isVisible()) {
      console.log('Login link found, clicking...');
      await loginLink.click();
      await page.waitForLoadState('networkidle');
      console.log(`Resulting URL: ${page.url()}`);
      console.log(`Resulting Title: ${await page.title()}`);
    } else {
      console.log('No explicit login link found on root. Attempting internal navigation via JS...');
      // Attempt to trigger the React Router if it's a standard SPA
      await page.evaluate(() => {
        const link = document.createElement('a');
        link.href = '/login';
        link.click();
      });
      await page.waitForTimeout(2000);
      console.log(`Resulting URL: ${page.url()}`);
      console.log(`Resulting Title: ${await page.title()}`);
    }

    if (page.url().includes('/login')) {
      console.log('\n--- Phase 3: Capture Browser Firebase Config ---');
      const config = await page.evaluate(() => {
        // Inspect window for any firebase config object
        for (let key in window) {
          if (key.toLowerCase().includes('firebaseconfig')) return window[key];
        }
        // Try to find it in the scripts or common patterns
        return null;
      });

      if (config) {
        console.log('CONFIG_FOUND');
        console.log(JSON.stringify(config));
      } else {
        console.log('CONFIG_NOT_FOUND_IN_WINDOW');
        // We will rely on network requests to identify the project if config is hidden
      }

      console.log('\n--- Phase 4: Production Browser Authentication ---');
      const email = process.env.PRODUCTION_OTP_TEST_EMAIL;
      const password = process.env.PRODUCTION_OTP_TEST_PASSWORD;

      if (!email || !password) {
        throw new Error('CREDENTIALS_MISSING');
      }

      // Use the actual UI to login
      const emailField = page.locator('input[type="email"], input[name="email"], input[placeholder*="email"]').first();
      const passField = page.locator('input[type="password"], input[name="password"], input[placeholder*="password"]').first();
      const loginBtn = page.locator('button:has-text("LOGIN"), button:has-text("Login"), button[type="submit"]').first();

      if (await emailField.isVisible()) {
        await emailField.fill(email);
        await passField.fill(password);
        await loginBtn.click();
        
        // Wait for redirect or error
        await page.waitForTimeout(5000);
        console.log(`Post-Login URL: ${page.url()}`);
        
        const title = await page.title();
        console.log(`Post-Login Title: ${title}`);
        
        if (title.includes('Dashboard') || page.url().includes('/dashboard')) {
          console.log('AUTH_SUCCESS');
        } else {
          console.log('AUTH_FAILED_OR_REDIRECTED');
        }
      } else {
        console.log('LOGIN_UI_NOT_RENDERED');
      }
    } else {
      console.log('FAILED_TO_REACH_LOGIN_PAGE');
    }

  } catch (e) {
    console.error('PROBE_FAILED:', e.message);
  } finally {
    await browser.close();
  }
}

run();
