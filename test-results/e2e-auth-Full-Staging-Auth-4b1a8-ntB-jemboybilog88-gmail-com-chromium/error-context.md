# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\auth.spec.js >> Full Staging Authentication & Authorization Suite >> Identity-Specific Flows >> Flow for residentB: jemboybilog88@gmail.com
- Location: tests\e2e\auth.spec.js:111:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/force-password-change/
Received string:  "https://saltwater-electricity-6da27aytp-saltwaterelectricitys-projects.vercel.app/dashboard"
Timeout: 15000ms

Call log:
  - Expect "toHaveURL" with timeout 15000ms
    13 × locator resolved to <html lang="en">…</html>
       - unexpected value "https://saltwater-electricity-6da27aytp-saltwaterelectricitys-projects.vercel.app/login"
    19 × locator resolved to <html lang="en">…</html>
       - unexpected value "https://saltwater-electricity-6da27aytp-saltwaterelectricitys-projects.vercel.app/dashboard"

```

```yaml
- complementary:
  - img "Logo"
  - heading "Device Monitoring" [level=1]
  - paragraph: Saltwater Electricity
  - button "Collapse"
  - navigation:
    - link "home Dashboard":
      - /url: /dashboard
    - link "monitoring Live Monitor":
      - /url: /monitor
    - paragraph: Operations
    - link "check_box Device Requests":
      - /url: /device-requests
    - link "devices Device Management":
      - /url: /admin/device-management
    - link "manage_accounts Resident Management":
      - /url: /admin/resident-management
    - link "notification_important Alerts":
      - /url: /alerts
    - link "history Historical Data":
      - /url: /history
    - link "receipt_long Audit Logs":
      - /url: /admin/audit-logs
    - paragraph: Account
    - link "settings Settings":
      - /url: /settings
  - text: JE Test User user
  - button "logout Log Out"
- main:
  - heading "Device Monitoring" [level=1]
  - paragraph: Saltwater Electricity
  - button "notifications"
  - button "settings_suggest"
  - button "TU"
  - heading "No Active Node" [level=2]
  - paragraph: Your account doesn't have an assigned monitoring unit yet. Contact the facility administrator to provision your hardware or submit a device request.
```

# Test source

```ts
  23  |       password: process.env.TEST_USER_RESIDENT_A_PASSWORD,
  24  |       expectedRole: "resident",
  25  |       expectedRoute: "/dashboard",
  26  |       requiresPasswordChange: true,
  27  |       tempPassword: "S3cur3!Pass2026_ResA",
  28  |     },
  29  |     residentB: {
  30  |       email: process.env.TEST_USER_RESIDENT_B_EMAIL,
  31  |       password: process.env.TEST_USER_RESIDENT_B_PASSWORD,
  32  |       expectedRole: "resident",
  33  |       expectedRoute: "/dashboard",
  34  |       requiresPasswordChange: true,
  35  |       tempPassword: "S3cur3!Pass2026_ResB",
  36  |     },
  37  |   };
  38  | 
  39  |   test.beforeEach(async ({ page }) => {
  40  |     const logs = [];
  41  |     page.on('console', (msg) => {
  42  |       const text = msg.text();
  43  |       if (text.includes('[AUTH-FORENSICS]') || text.includes('[ROUTE-FORENSICS]')) {
  44  |         logs.push({
  45  |           timestamp: new Date().toISOString(),
  46  |           type: msg.type(),
  47  |           text: text,
  48  |           url: page.url(),
  49  |         });
  50  |       }
  51  |     });
  52  | 
  53  |     page.on('requestfailed', (request) => {
  54  |       logs.push({
  55  |         timestamp: new Date().toISOString(),
  56  |         type: 'REQUEST_FAILED',
  57  |         text: `Request failed: ${request.url()} - ${request.failure()?.errorText}`,
  58  |         url: page.url(),
  59  |       });
  60  |     });
  61  | 
  62  |     page.on('pageerror', (exception) => {
  63  |       logs.push({
  64  |         timestamp: new Date().toISOString(),
  65  |         type: 'PAGE_ERROR',
  66  |         text: `Exception: ${exception.message}`,
  67  |         url: page.url(),
  68  |       });
  69  |     });
  70  | 
  71  |     page.forensicLogs = logs;
  72  | 
  73  |     await page.route("**/*", async (route) => {
  74  |       const url = route.request().url();
  75  |       if (
  76  |         url.includes("saltwater-electricity-261iibdt3-saltwaterelectricitys-projects.vercel.app")
  77  |       ) {
  78  |         const bypassToken = process.env.VERCEL_PROTECTION_BYPASS_TOKEN || "";
  79  |         const separator = url.includes("?") ? "&" : "?";
  80  |         const newUrl = `${url}${separator}x-vercel-protection-bypass=${bypassToken}`;
  81  |         await route.continue({ url: newUrl });
  82  |       } else {
  83  |         await route.continue();
  84  |       }
  85  |     });
  86  |   });
  87  | 
  88  |   test.afterEach(async ({ page }, testInfo) => {
  89  |     if (testInfo.status !== testInfo.expectedStatus) {
  90  |       console.log(`\n--- FORENSIC TIMELINE for ${testInfo.title} ---`);
  91  |       if (page.forensicLogs && page.forensicLogs.length > 0) {
  92  |         page.forensicLogs.forEach((log, i) => {
  93  |           console.log(`[${i}] ${log.timestamp} | ${log.type} | ${log.url} | ${log.text}`);
  94  |         });
  95  |       } else {
  96  |         console.log('No forensic logs captured.');
  97  |       }
  98  |       console.log(`--- END FORENSIC TIMELINE ---\n`);
  99  |     }
  100 |   });
  101 | 
  102 |   async function performLogin(page, email, password) {
  103 |     await page.goto("/login");
  104 |     await page.locator('input[placeholder="name@example.com"]').fill(email);
  105 |     await page.locator('input[placeholder="••••••••"]').fill(password);
  106 |     await page.click('button:has-text("LOGIN NOW")');
  107 |   }
  108 | 
  109 |   test.describe("Identity-Specific Flows", () => {
  110 |     for (const [roleKey, user] of Object.entries(TEST_USERS)) {
  111 |       test(`Flow for ${roleKey}: ${user.email}`, async ({ page }) => {
  112 |         console.log(`🚀 Testing flow for ${roleKey}...`);
  113 | 
  114 |         const rtdbRequestPromise = page
  115 |           .waitForRequest((request) => request.url().includes("firebasedatabase.app"), {
  116 |             timeout: 10000,
  117 |           })
  118 |           .catch(() => null);
  119 | 
  120 |         await performLogin(page, user.email, user.password);
  121 | 
  122 |         if (user.requiresPasswordChange) {
> 123 |           await expect(page).toHaveURL(/\/force-password-change/, { timeout: 15000 });
      |                              ^ Error: expect(page).toHaveURL(expected) failed
  124 | 
  125 |           await page.locator('input[name="newPassword"]').fill(user.tempPassword);
  126 |           await page.locator('input[name="confirmPassword"]').fill(user.tempPassword);
  127 |           await page.click('button:has-text("Secure Account & Continue")');
  128 | 
  129 |           // INTENTIONAL: authenticated users are redirected to dashboard via RootRedirect
  130 |           await expect(page).toHaveURL(user.expectedRoute, { timeout: 15000 });
  131 |           console.log(`✅ ${roleKey} redirected to ${user.expectedRoute} after password change.`);
  132 | 
  133 |           const logoutBtn = page.locator("text=Logout");
  134 |           if (await logoutBtn.isVisible()) {
  135 |             await logoutBtn.click();
  136 |           }
  137 |           await expect(page).toHaveURL(/\/login|\//, { timeout: 10000 });
  138 | 
  139 |           await performLogin(page, user.email, user.tempPassword);
  140 |           await expect(page).toHaveURL(user.expectedRoute, { timeout: 15000 });
  141 |           console.log(`✅ ${roleKey} authenticated with new password.`);
  142 | 
  143 |           const finalLogout = page.locator("text=Logout");
  144 |           if (await finalLogout.isVisible()) {
  145 |             await finalLogout.click();
  146 |           }
  147 |           await expect(page).toHaveURL(/\/login|\//, { timeout: 10000 });
  148 | 
  149 |           await performLogin(page, user.email, user.password);
  150 |           await expect(page.locator("text=Invalid email or password")).toBeVisible({
  151 |             timeout: 10000,
  152 |           });
  153 |           console.log(`✅ ${roleKey}: Old password rejected.`);
  154 |         } else {
  155 |           await expect(page).toHaveURL(user.expectedRoute, { timeout: 15000 });
  156 |           console.log(`✅ ${roleKey} redirected to expected route: ${user.expectedRoute}`);
  157 |         }
  158 | 
  159 |         const dbRequest = await rtdbRequestPromise;
  160 |         if (dbRequest) {
  161 |           expect(dbRequest.url()).toContain("saltwater-electricity-staging");
  162 |         }
  163 | 
  164 |         const finalLogout = page.locator("text=Logout");
  165 |         if (await finalLogout.isVisible()) {
  166 |           await finalLogout.click();
  167 |           await expect(page).toHaveURL(/\/login|\//, { timeout: 10000 });
  168 |         }
  169 |       });
  170 |     }
  171 |   });
  172 | 
  173 |   test("Cross-role Authorization: Resident cannot access Admin routes", async ({ page }) => {
  174 |     console.log("🚀 Testing Cross-role Isolation: Resident -> Admin...");
  175 |     await performLogin(page, TEST_USERS.residentA.email, TEST_USERS.residentA.password);
  176 | 
  177 |     if (TEST_USERS.residentA.requiresPasswordChange) {
  178 |       await page.locator('input[name="newPassword"]').fill(TEST_USERS.residentA.tempPassword);
  179 |       await page.locator('input[name="confirmPassword"]').fill(TEST_USERS.residentA.tempPassword);
  180 |       await page.click('button:has-text("Secure Account & Continue")');
  181 |     }
  182 | 
  183 |     await page.goto("/admin/user-management");
  184 |     // Verify that the PrivateRoute returns <NotFound />
  185 |     await expect(page.locator("text=Page Not Found")).toBeVisible({ timeout: 10000 });
  186 |     console.log("✅ Resident blocked from Admin route (NotFound rendered).");
  187 | 
  188 |     const logoutBtn = page.locator("text=Logout");
  189 |     if (await logoutBtn.isVisible()) {
  190 |       await logoutBtn.click();
  191 |     }
  192 |   });
  193 | 
  194 |   test("Cross-role Authorization: Admin cannot access SuperAdmin routes", async ({ page }) => {
  195 |     console.log("🚀 Testing Cross-role Isolation: Admin -> SuperAdmin...");
  196 |     await performLogin(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
  197 | 
  198 |     if (TEST_USERS.admin.requiresPasswordChange) {
  199 |       await page.locator('input[name="newPassword"]').fill(TEST_USERS.admin.tempPassword);
  200 |       await page.locator('input[name="confirmPassword"]').fill(TEST_USERS.admin.tempPassword);
  201 |       await page.click('button:has-text("Secure Account & Continue")');
  202 |     }
  203 | 
  204 |     await page.goto("/admin/register-staff");
  205 |     await expect(page.locator("text=Page Not Found")).toBeVisible({ timeout: 10000 });
  206 |     console.log("✅ Admin blocked from SuperAdmin route (NotFound rendered).");
  207 | 
  208 |     const logoutBtn = page.locator("text=Logout");
  209 |     if (await logoutBtn.isVisible()) {
  210 |       await logoutBtn.click();
  211 |     }
  212 |   });
  213 | });
  214 | 
```