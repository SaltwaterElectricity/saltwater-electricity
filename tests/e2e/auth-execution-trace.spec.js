import { test, expect } from "@playwright/test";

async function trace(label, value) {
  console.log(`[auth-trace] ${label}: ${typeof value === 'object' ? JSON.stringify(value) : value}`);
}

test("SuperAdmin Auth Execution Trace", async ({ page }) => {
  console.log("\n--- START AUTH EXECUTION TRACE: SuperAdmin ---");

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

  // Capture console and page errors
  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`[auth-trace] console-error: ${msg.text()}`);
  });
  page.on('pageerror', err => {
    console.log(`[auth-trace] page-error: ${err.message}`);
  });

  await page.goto("/login");
  await trace("pre-login-url", page.url());

  // 1. Login Submission
  await page.locator('input[placeholder="name@example.com"]').fill(process.env.TEST_USER_SUPERADMIN_EMAIL);
  await page.locator('input[placeholder="••••••••"]').fill(process.env.TEST_USER_SUPERADMIN_PASSWORD);
  
  await trace("action", "clicking login button");
  
  // Intercept Firebase
  const firebaseReqPromise = page.waitForRequest(req => req.url().includes("identitytoolkit.googleapis.com"), { timeout: 15000 }).catch(() => null);
  
  await page.click('button:has-text("LOGIN NOW")');

  const firebaseReq = await firebaseReqPromise;
  if (firebaseReq) {
    const resp = await firebaseReq.response();
    await trace("firebase-status", resp?.status());
    if (resp) {
      const body = await resp.json();
      await trace("firebase-result", body.error ? "FAILURE" : "SUCCESS");
      if (body.error) await trace("firebase-error", body.error.message);
    }
  } else {
    await trace("firebase-request", "NOT_SENT");
  }

  // 2. Trace Application State after Firebase success
  // Use page.evaluate to inspect window-level state if available, 
  // but mostly rely on URL and DOM.
  try {
    await page.waitForLoadState("networkidle");
    
    // Check for "Invalid email or password"
    const invalidMsg = await page.locator('text=Invalid email or password').isVisible();
    await trace("invalid-credentials-msg", invalidMsg);

    // Check for any redirect
    const finalUrl = page.url();
    await trace("final-url", finalUrl);

    if (!finalUrl.includes("/login")) {
      // We are in the app. Probe the DOM for auth state markers.
      const pageTitle = await page.title();
      await trace("page-title", pageTitle);
    }
  } catch (e) {
    await trace("state-probe-error", e.message);
  }

  console.log("--- END AUTH EXECUTION TRACE: SuperAdmin ---\n");
});
