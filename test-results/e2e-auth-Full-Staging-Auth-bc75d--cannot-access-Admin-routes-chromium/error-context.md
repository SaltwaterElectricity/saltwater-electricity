# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\auth.spec.js >> Full Staging Authentication & Authorization Suite >> Cross-role Authorization: Resident cannot access Admin routes
- Location: tests\e2e\auth.spec.js:173:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[name="newPassword"]')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6] [cursor=pointer]:
        - img "Logo" [ref=e8]
        - generic [ref=e9]:
          - heading "Device Monitoring" [level=1] [ref=e10]
          - paragraph [ref=e11]: Saltwater Electricity
      - button "Collapse" [ref=e12]
    - navigation [ref=e15]:
      - link "home Dashboard" [ref=e16] [cursor=pointer]:
        - /url: /dashboard
        - generic [ref=e17]: home
        - generic [ref=e18]: Dashboard
      - link "monitoring Live Monitor" [ref=e19] [cursor=pointer]:
        - /url: /monitor
        - generic [ref=e20]: monitoring
        - generic [ref=e21]: Live Monitor
      - paragraph [ref=e23]: Operations
      - link "check_box Device Requests" [ref=e24] [cursor=pointer]:
        - /url: /device-requests
        - generic [ref=e25]: check_box
        - generic [ref=e26]: Device Requests
      - link "devices Device Management" [ref=e27] [cursor=pointer]:
        - /url: /admin/device-management
        - generic [ref=e28]: devices
        - generic [ref=e29]: Device Management
      - link "manage_accounts Resident Management" [ref=e30] [cursor=pointer]:
        - /url: /admin/resident-management
        - generic [ref=e31]: manage_accounts
        - generic [ref=e32]: Resident Management
      - link "notification_important Alerts" [ref=e33] [cursor=pointer]:
        - /url: /alerts
        - generic [ref=e34]: notification_important
        - generic [ref=e35]: Alerts
      - link "history Historical Data" [ref=e36] [cursor=pointer]:
        - /url: /history
        - generic [ref=e37]: history
        - generic [ref=e38]: Historical Data
      - link "receipt_long Audit Logs" [ref=e39] [cursor=pointer]:
        - /url: /admin/audit-logs
        - generic [ref=e40]: receipt_long
        - generic [ref=e41]: Audit Logs
      - paragraph [ref=e43]: Account
      - link "settings Settings" [ref=e44] [cursor=pointer]:
        - /url: /settings
        - generic [ref=e45]: settings
        - generic [ref=e46]: Settings
    - generic [ref=e47]:
      - generic [ref=e49]:
        - generic [ref=e50]: MH
        - generic [ref=e51]:
          - generic [ref=e52]: Test User
          - generic [ref=e53]: user
      - button "logout Log Out" [ref=e55]:
        - generic [ref=e56]: logout
        - generic [ref=e57]: Log Out
  - main [ref=e58]:
    - generic [ref=e59]:
      - generic [ref=e60]:
        - generic:
          - generic:
            - heading "Device Monitoring" [level=1]
            - paragraph: Saltwater Electricity
      - generic [ref=e61]:
        - button "notifications" [ref=e62]
        - button "settings_suggest" [ref=e65]
        - button "TU" [ref=e69]
    - generic [ref=e73]:
      - heading "No Active Node" [level=2] [ref=e79]
      - paragraph [ref=e80]: Your account doesn't have an assigned monitoring unit yet. Contact the facility administrator to provision your hardware or submit a device request.
```

# Test source

```ts
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
  123 |           await expect(page).toHaveURL(/\/force-password-change/, { timeout: 15000 });
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
> 178 |       await page.locator('input[name="newPassword"]').fill(TEST_USERS.residentA.tempPassword);
      |                                                       ^ Error: locator.fill: Test timeout of 30000ms exceeded.
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