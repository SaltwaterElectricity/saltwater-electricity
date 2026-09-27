import { test, expect } from "@playwright/test";

async function traceStep(label, data) {
  console.log(`[auth-trace] ${label}: ${typeof data === 'object' ? JSON.stringify(data) : data}`);
}

test("Deterministic SuperAdmin Auth Trace", async ({ page }) => {
  console.log("\n--- START DETERMINISTIC TRACE: SuperAdmin ---");
  
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

  // 1. Pre-login check
  await page.goto("/login");
  await traceStep("final-url", page.url());
  await traceStep("page-title", await page.title());
  const loginFormVisible = await page.locator('form').isVisible();
  await traceStep("login-form-visible", loginFormVisible);
  const emailVisible = await page.locator('input[placeholder="name@example.com"]').isVisible();
  await traceStep("email-field-visible", emailVisible);
  const passVisible = await page.locator('input[placeholder="••••••••"]').isVisible();
  await traceStep("password-field-visible", passVisible);
  const btnEnabled = await page.locator('button:has-text("LOGIN NOW")').isEnabled();
  await traceStep("login-button-enabled", btnEnabled);

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[auth-trace] console-error: ${msg.text()}`);
    }
  });

  // 2. Login submission
  console.log("Submitting Login...");
  await traceStep("login-submit", "clicking button");
  
  // Intercept Firebase requests
  const firebaseRequestPromise = page.waitForRequest(req => 
    req.url().includes("identitytoolkit.googleapis.com"), 
    { timeout: 15000 }
  ).catch(() => null);

  await page.locator('input[placeholder="name@example.com"]').fill(process.env.TEST_USER_SUPERADMIN_EMAIL);
  await page.locator('input[placeholder="••••••••"]').fill(process.env.TEST_USER_SUPERADMIN_PASSWORD);
  await page.click('button:has-text("LOGIN NOW")');

  const firebaseReq = await firebaseRequestPromise;
  if (firebaseReq) {
    await traceStep("firebase-auth-request", firebaseReq.url());
    const response = await firebaseReq.response();
    if (response) {
      await traceStep("firebase-auth-status", response.status());
      const body = await response.json();
      if (body.error) {
        await traceStep("firebase-auth-failure", body.error.message);
      } else {
        await traceStep("firebase-auth-success", "true");
      }
    }
  } else {
    await traceStep("firebase-auth-request", "NOT_SENT");
  }

  // 3. Post-auth state trace
  try {
    // Wait for redirect or failure message
    await Promise.race([
      page.waitForURL(url => !url.href().includes('/login'), { timeout: 15000 }),
      page.waitForSelector('text=Invalid email or password', { timeout: 15000 })
    ]);
  } catch (e) {
    await traceStep("navigation-timeout", "true");
  }

  const finalUrl = page.url();
  await traceStep("final-url", finalUrl);

  // Try to probe runtime state if authenticated
  if (!finalUrl.includes("/login")) {
    const state = await page.evaluate(() => {
      // This assumes we can find some state in the window or via the DOM
      return {
        url: window.location.href,
        documentTitle: document.title,
      };
    });
    await traceStep("runtime-state", state);
  } else {
    const isInvalidMsg = await page.locator('text=Invalid email or password').isVisible();
    await traceStep("invalid-credentials-msg", isInvalidMsg);
  }

  console.log("--- END DETERMINISTIC TRACE: SuperAdmin ---\n");
});
