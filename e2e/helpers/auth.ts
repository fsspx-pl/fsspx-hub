import { Page, expect } from '@playwright/test';

export interface AdminCredentials {
  email: string;
  password: string;
}

/**
 * Login to PayloadCMS admin panel
 */
export async function loginToAdmin(page: Page, credentials: AdminCredentials) {
  await page.goto('/admin');
  
  // Wait for login form to load
  await page.waitForSelector('input[name="email"]', { timeout: 10000 });
  
  // Fill in credentials
  await page.fill('input[name="email"]', credentials.email);
  await page.fill('input[name="password"]', credentials.password);
  
  // Click login button
  await page.click('button[type="submit"]');
  
  // Wait for redirect to admin dashboard
  await page.waitForURL('**/admin**', { timeout: 10000 });
  
  // Verify we're logged in by checking for admin UI elements
  await expect(page.locator('nav')).toBeVisible({ timeout: 5000 });
}

/**
 * Logout from PayloadCMS admin panel
 */
export async function logoutFromAdmin(page: Page) {
  // Look for user menu or logout button
  const accountButton = page.locator('[data-test-id="account"], .account-menu, [aria-label*="Account"]').first();
  
  if (await accountButton.isVisible()) {
    await accountButton.click();
    const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")').first();
    await logoutButton.click();
    await page.waitForURL('**/admin/login**');
  }
}

/**
 * Check if already logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  await page.goto('/admin');
  await page.waitForLoadState('networkidle');
  
  const url = page.url();
  return !url.includes('/login');
}

