import { test, expect } from "@playwright/test";

test.describe("Vercel Deployment Protection Bypass & Identity Proof", () => {
  test.beforeEach(async ({ page }) => {
    // Set the bypass header ONLY for the Vercel Preview origin
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

  test("Phase A: should bypass Vercel protection and reach the application", async ({ page }) => {
    console.log("🚀 Starting Phase A: Access Proof...");

    page.on("console", (msg) => console.log(`BROWSER CONSOLE: [${msg.type()}] ${msg.text()}`));

    await page.goto("/", { waitUntil: "domcontentloaded", timeout: 30000 });

    console.log(`Final URL: ${page.url()}`);

    const title = await page.title();
    console.log(`Page Title: ${title}`);

    const isDashboard = title.includes("Dashboard");
    const getStartedBtn = page.locator("text=Get Started");
    const loginNowBtn = page.locator("text=Login Now");
    const loginInput = page.locator('input[placeholder="name@example.com"]');

    const isLandingPage = (await getStartedBtn.isVisible()) || (await loginNowBtn.isVisible());
    const isLoginPage = await loginInput.isVisible();

    console.log(`Detected Dashboard: ${isDashboard}`);
    console.log(`Detected Landing Page: ${isLandingPage}`);
    console.log(`Detected Login Page: ${isLoginPage}`);

    expect(isDashboard || isLandingPage || isLoginPage).toBeTruthy();
    console.log("✅ Phase A PASS: Application reached successfully.");
  });

  test("Phase B: should prove runtime connection to Firebase Staging", async ({ page }) => {
    console.log("🚀 Starting Phase B: Firebase Identity Proof...");

    // Ensure we start from a clean state for identity proof
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Runtime Proof: We will try to find the project ID in the window object
    // since network requests might be asynchronous and timing-sensitive.
    const runtimeIdentity = await page.evaluate(() => {
      // Check multiple common locations for Firebase config in the browser
      return {
        config: window.firebaseConfig?.projectId || "NOT_FOUND",
        app: (window.firebaseApp && window.firebaseApp.app?.options?.projectId) || "NOT_FOUND",
        // If the app uses internal state, we try to find the initialized Firebase app instance
        // via common global variables if they exist.
      };
    });

    console.log(`Runtime Project ID (via config): ${runtimeIdentity.config}`);
    console.log(`Runtime Project ID (via app): ${runtimeIdentity.app}`);

    if (
      runtimeIdentity.config === "saltwater-electricity-staging" ||
      runtimeIdentity.app === "saltwater-electricity-staging"
    ) {
      console.log("✅ Phase B PASS: Runtime identity verified as STAGING.");
    } else {
      console.log(
        `❌ Phase B FAIL: Runtime identity is ${runtimeIdentity.config} / ${runtimeIdentity.app}`
      );

      // Fallback: Try to capture a network request if config is not globally exposed
      try {
        const requestPromise = page.waitForRequest(
          (request) =>
            request.url().includes("identitytoolkit.googleapis.com") ||
            request.url().includes("firebasedatabase.app"),
          { timeout: 10000 }
        );

        await page
          .locator("text=Login Now")
          .click()
          .catch(() => {});
        const request = await requestPromise;

        if (request.url().includes("saltwater-electricity-staging")) {
          console.log("✅ Phase B PASS: Runtime identity verified as STAGING via network request.");
          return;
        }
      } catch {
        console.log("Network fallback failed to prove identity.");
      }

      throw new Error(`Expected staging project, but could not verify runtime identity.`);
    }
  });
});
