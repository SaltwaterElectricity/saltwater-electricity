import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    // Vite's default dev port is 5173
    await page.goto('http://localhost:5173/login');
  });

  test('should show progress bar after successful login', async ({ page }) => {
    // 1. Fill in the email and password fields
    await page.getByPlaceholder('name@example.com').fill('test@example.com');
    await page.getByPlaceholder('••••••••').fill('password123');

    // 2. Click the 'LOGIN NOW' button
    // We use a regular expression for the button name to handle icons/extra text
    await page.getByRole('button', { name: /LOGIN NOW/i }).click();

    // 3. Verify that the 'isRedirecting' progress bar animation appears
    // In our implementation, this is the "Access Granted" modal with the progress bar
    const statusText = page.getByText(/Access Granted/i);
    const progressText = page.getByText(/Establishing Secure Tunnel/i);
    const progressBar = page.locator('.progress-shimmer');

    await expect(statusText).toBeVisible({ timeout: 10000 });
    await expect(progressText).toBeVisible();
    await expect(progressBar).toBeVisible();
    
    // Optional: Verify it eventually navigates to dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
  });
});
