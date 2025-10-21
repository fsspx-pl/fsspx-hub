import { Page, expect } from '@playwright/test';

/**
 * Navigate to a specific collection in PayloadCMS admin
 */
export async function navigateToCollection(page: Page, collectionSlug: string) {
  // Go to admin if not already there
  if (!page.url().includes('/admin')) {
    await page.goto('/admin');
  }
  
  // Navigate to the collection
  await page.goto(`/admin/collections/${collectionSlug}`);
  
  // Wait for the collection list to load
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[class*="list-controls"], [class*="collection"], table, .table', { 
    timeout: 10000,
    state: 'visible'
  });
}

/**
 * Click the "Create New" button for a collection
 */
export async function clickCreateNew(page: Page) {
  // Look for create new button with various possible selectors
  const createButton = page.locator(
    'a:has-text("Create New"), a:has-text("Create"), button:has-text("Create New"), [href*="/create"]'
  ).first();
  
  await expect(createButton).toBeVisible({ timeout: 5000 });
  await createButton.click();
  
  // Wait for the create form to load
  await page.waitForLoadState('networkidle');
}

/**
 * Fill a field in PayloadCMS admin form
 */
export async function fillField(page: Page, fieldName: string, value: string) {
  const input = page.locator(`input[name="${fieldName}"], select[name="${fieldName}"], textarea[name="${fieldName}"]`).first();
  await input.fill(value);
}

/**
 * Select a value from a relationship field
 */
export async function selectRelationship(page: Page, fieldName: string, valueName: string) {
  // Click on the relationship field to open dropdown
  const fieldSelector = `[id="field-${fieldName}"]`;
  await page.click(fieldSelector);
  
  // Wait for dropdown and select the value
  await page.waitForSelector(`text="${valueName}"`, { timeout: 5000 });
  await page.click(`text="${valueName}"`);
}

/**
 * Click the save/create button in a form
 */
export async function clickSave(page: Page) {
  const saveButton = page.locator(
    'button#action-save'
  ).first();
  
  await expect(saveButton).toBeVisible();
  await saveButton.click();
}

/**
 * Wait for success notification
 */
export async function waitForSuccessNotification(page: Page) {
  const notification = page.locator('[aria-label="Notifications alt+T"] li');
  await expect(notification).toHaveAttribute('data-type', 'success');
}

/**
 * Get count of items in a collection list
 */
export async function getCollectionItemCount(page: Page): Promise<number> {
  // Look for table rows or list items
  const rows = await page.locator('tbody tr, [class*="list-item"]').count();
  return rows;
}

/**
 * Search for an item in collection list
 */
export async function searchInCollection(page: Page, searchTerm: string) {
  const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();
  await searchInput.fill(searchTerm);
  await page.waitForLoadState('networkidle');
}

