# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.js >> Login Page >> should show progress bar after successful login
- Location: tests\login.spec.js:9:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/Access Granted/i)
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText(/Access Granted/i)

```

# Page snapshot

```yaml
- main [ref=e4]:
  - generic [ref=e5]:
    - generic [ref=e7]:
      - generic:
        - heading "Device Monitoring" [level=1]
        - heading "Saltwater Electricity" [level=2]
    - generic [ref=e18]:
      - generic [ref=e19]:
        - heading "Welcome Back" [level=1] [ref=e20]
        - paragraph [ref=e21]: Saltwater Device Monitoring
        - paragraph [ref=e22]: Please enter the needed information.
      - generic [ref=e24]:
        - generic [ref=e25]:
          - generic [ref=e27]:
            - generic [ref=e28]: report
            - text: Invalid email or password. Please try again.
          - generic [ref=e29]:
            - generic [ref=e30]: Email Address
            - textbox "name@example.com" [ref=e32]: test@example.com
          - generic [ref=e33]:
            - generic [ref=e34]:
              - generic [ref=e35]: Password
              - button "Forgot?" [ref=e36]
            - textbox "••••••••" [ref=e38]: password123
          - button "LOGIN NOW login" [ref=e40]:
            - generic [ref=e41]: LOGIN NOW
            - generic [ref=e42]: login
        - generic [ref=e43]:
          - paragraph [ref=e44]: New user or missing device?
          - generic [ref=e45]:
            - link "How to get a device" [ref=e46] [cursor=pointer]:
              - /url: "#"
            - link "Contact Facility Admin" [ref=e47] [cursor=pointer]:
              - /url: "#"
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Login Page", () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Vite's default dev port is 5173
  6  |     await page.goto("http://localhost:5173/login");
  7  |   });
  8  | 
  9  |   test("should show progress bar after successful login", async ({ page }) => {
  10 |     // 1. Fill in the email and password fields
  11 |     await page.getByPlaceholder("name@example.com").fill("test@example.com");
  12 |     await page.getByPlaceholder("••••••••").fill("password123");
  13 | 
  14 |     // 2. Click the 'LOGIN NOW' button
  15 |     // We use a regular expression for the button name to handle icons/extra text
  16 |     await page.getByRole("button", { name: /LOGIN NOW/i }).click();
  17 | 
  18 |     // 3. Verify that the 'isRedirecting' progress bar animation appears
  19 |     // In our implementation, this is the "Access Granted" modal with the progress bar
  20 |     const statusText = page.getByText(/Access Granted/i);
  21 |     const progressText = page.getByText(/Establishing Secure Tunnel/i);
  22 |     const progressBar = page.locator(".progress-shimmer");
  23 | 
> 24 |     await expect(statusText).toBeVisible({ timeout: 10000 });
     |                              ^ Error: expect(locator).toBeVisible() failed
  25 |     await expect(progressText).toBeVisible();
  26 |     await expect(progressBar).toBeVisible();
  27 | 
  28 |     // Optional: Verify it eventually navigates to dashboard
  29 |     await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
  30 |   });
  31 | });
  32 | 
```