import { test, expect } from "@playwright/test";

test("Deep SuperAdmin Trace", async ({ page }) => {
  console.log("\n--- START DEEP RUNTIME TRACE: SuperAdmin ---");
  
  const urlHistory = [];
  page.on('framenavigated', frame => {
    if (frame === page.mainFrame()) {
      console.log(`NAVIGATED TO: ${frame.url()}`);
      urlHistory.push(frame.url());
    }
  });

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

  console.log("1. Navigating to /login...");
  await page.goto("/login");
  
  console.log("2. Performing Login...");
  await page.locator('input[placeholder="name@example.com"]').fill(process.env.TEST_USER_SUPERADMIN_EMAIL);
  await page.locator('input[placeholder="••••••••"]').fill(process.env.TEST_USER_SUPERADMIN_PASSWORD);
  await page.click('button:has-text("LOGIN NOW")');

  // Wait for a significant URL change or timeout
  try {
    await page.waitForURL(url => url.href().includes('/dashboard') || url.href().includes('/admin') || url.href().includes('/force-password-change'), { timeout: 30000 });
  } catch (e) {
    console.log("TIMEOUT waiting for redirect. Current URL:", page.url());
  }

  const finalUrl = page.url();
  console.log(`3. Final URL: ${finalUrl}`);
  
  const content = await page.content();
  if (content.includes("Invalid email or password")) {
    console.log("RESULT: AUTHENTICATION FAILED (Invalid email or password)");
  } else if (finalUrl.includes("/login")) {
    console.log("RESULT: STUCK ON LOGIN PAGE (No redirect happened)");
  } else {
    console.log(`RESULT: LANDED ON ${finalUrl}`);
  }

  console.log("URL HISTORY:", urlHistory.join(" -> "));
  console.log("--- END DEEP RUNTIME TRACE: SuperAdmin ---\n");
});
