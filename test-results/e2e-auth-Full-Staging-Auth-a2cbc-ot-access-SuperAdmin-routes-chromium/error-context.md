# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\auth.spec.js >> Full Staging Authentication & Authorization Suite >> Cross-role Authorization: Admin cannot access SuperAdmin routes
- Location: tests\e2e\auth.spec.js:194:3

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
      - link "monitoring Realtime Monitor" [ref=e19] [cursor=pointer]:
        - /url: /monitor
        - generic [ref=e20]: monitoring
        - generic [ref=e21]: Realtime Monitor
      - paragraph [ref=e23]: Operations
      - link "check_box Request Validation" [ref=e24] [cursor=pointer]:
        - /url: /admin/request-management
        - generic [ref=e25]: check_box
        - generic [ref=e26]: Request Validation
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
        - generic [ref=e50]: KA
        - generic [ref=e51]:
          - generic [ref=e52]: Test User
          - generic [ref=e53]: admin
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
    - generic [ref=e72]:
      - generic [ref=e73]:
        - generic [ref=e74]:
          - generic [ref=e75]:
            - generic [ref=e76]: router
            - generic [ref=e78]:
              - generic [ref=e79]: arrow_drop_up
              - text: Live
          - generic [ref=e80]:
            - paragraph [ref=e81]: Total Devices
            - heading "0" [level=2] [ref=e82]
          - paragraph [ref=e84]: Since last month
        - generic [ref=e91]:
          - generic [ref=e92]:
            - generic [ref=e93]: sensors
            - generic [ref=e95]:
              - generic [ref=e96]: arrow_drop_up
              - text: Live
          - generic [ref=e97]:
            - paragraph [ref=e98]: online Device
            - heading "0" [level=2] [ref=e99]
          - paragraph [ref=e101]: Active warnings
        - generic [ref=e108]:
          - generic [ref=e109]:
            - generic [ref=e110]: signal_wifi_off
            - generic [ref=e112]:
              - generic [ref=e113]: arrow_drop_down
              - text: Live
          - generic [ref=e114]:
            - paragraph [ref=e115]: Offline Devices
            - heading "0" [level=2] [ref=e116]
          - paragraph [ref=e118]: Network status
        - generic [ref=e125]:
          - generic [ref=e126]:
            - generic [ref=e127]: ecg_heart
            - generic [ref=e129]:
              - generic [ref=e130]: trending_up
              - text: Checkup
          - generic [ref=e131]:
            - paragraph [ref=e132]: System Health
            - heading "0%" [level=2] [ref=e133]
          - generic [ref=e135]:
            - generic [ref=e136]: Overall efficiency
            - generic [ref=e137]: Checkup
      - generic [ref=e139]:
        - generic [ref=e141]:
          - generic [ref=e142]:
            - generic [ref=e143]:
              - heading "Performance Line Chart" [level=3] [ref=e144]
              - paragraph [ref=e146]: No comparative devices selected
            - button "Recent Audit Stream" [ref=e148]
          - generic [ref=e155]:
            - heading "No Units for Audit" [level=4] [ref=e158]
            - paragraph [ref=e159]: Provision hardware units to begin comparative performance auditing.
        - generic [ref=e161]:
          - heading "System Health" [level=3] [ref=e162]
          - generic [ref=e175]:
            - generic [ref=e176]: 0%
            - generic [ref=e177]: CRITICAL
          - generic [ref=e178]:
            - generic [ref=e179]:
              - generic [ref=e180]: Voltage
              - paragraph [ref=e183]: 0%
            - generic [ref=e184]:
              - generic [ref=e185]: Salinity
              - paragraph [ref=e188]: 0%
            - generic [ref=e189]:
              - generic [ref=e190]: Current
              - paragraph [ref=e193]: 0%
      - generic [ref=e194]:
        - generic [ref=e195]:
          - generic [ref=e196]:
            - heading "System Alerts" [level=3] [ref=e198]
            - paragraph [ref=e203]: No active alerts recorded.
            - button "View all alerts" [ref=e205]
          - generic [ref=e208]:
            - heading "DEVICE REQUEST" [level=3] [ref=e209]
            - paragraph [ref=e211]: No pending requests
            - button "View all requests" [ref=e213]
        - generic [ref=e216]:
          - generic [ref=e217]:
            - generic [ref=e218]:
              - heading "DEVICES Feature Data" [level=3] [ref=e219]
              - generic [ref=e220]:
                - generic [ref=e221]: Voltage
                - generic [ref=e224]: Salinity
                - generic [ref=e227]: Current
            - paragraph [ref=e234]: No Data Records Found
          - generic [ref=e235]:
            - generic [ref=e236]:
              - heading "DEVICE USER'S" [level=3] [ref=e237]
              - generic [ref=e238]:
                - textbox "Search users..." [ref=e239]
                - generic [ref=e240]: search
            - table [ref=e242]:
              - rowgroup [ref=e243]:
                - row [ref=e244]:
                  - columnheader "HOUSEHOLD USER" [ref=e245]
                  - columnheader "location" [ref=e246]
                  - columnheader "Device id" [ref=e247]
                  - columnheader "Receive Date" [ref=e248]
                  - columnheader "Action" [ref=e249]
              - rowgroup [ref=e250]:
                - row [ref=e251]:
                  - cell "person_off No active assignments found" [ref=e252]:
                    - generic [ref=e253]:
                      - generic [ref=e254]: person_off
                      - paragraph [ref=e255]: No active assignments found
            - button "View all users arrow_forward" [ref=e257]:
              - text: View all users
              - generic [ref=e258]: arrow_forward
```

# Test source

```ts
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
> 199 |       await page.locator('input[name="newPassword"]').fill(TEST_USERS.admin.tempPassword);
      |                                                       ^ Error: locator.fill: Test timeout of 30000ms exceeded.
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