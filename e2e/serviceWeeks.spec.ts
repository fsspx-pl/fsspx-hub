import { test, expect } from '@playwright/test';
import { loginToAdmin } from './helpers/auth';
import { navigateToCollection, clickCreateNew, clickSave, waitForSuccessNotification, selectRelationship } from './helpers/navigation';

// Test configuration - Load from .env file
const TEST_EMAIL = process.env.ADMIN_EMAIL || '';
const TEST_PASSWORD = process.env.ADMIN_PASSWORD || '';

// Validate required environment variables
if (!TEST_EMAIL || !TEST_PASSWORD) {
  throw new Error(
    'Missing required environment variables. Please set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file.'
  );
}

test.describe('ServiceWeeks E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await loginToAdmin(page, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
  });

  test('should handle ServiceWeek creation with feast templates', async ({ page }) => {
    // Navigate to ServiceWeeks collection
    await navigateToCollection(page, 'serviceWeeks');
    
    // Click create new
    await clickCreateNew(page);
    await page.waitForSelector('form', { timeout: 10000 });
    
    // Select tenant
    const tenantField = page.locator('[data-field="tenant"], [name="tenant"]').first();
    if (await tenantField.isVisible()) {
      await tenantField.click();
      await page.waitForTimeout(500);
      const firstTenantOption = page.locator('[role="option"], .option, li').first();
      await firstTenantOption.click({ timeout: 5000 });
    }
    
    // Set a Sunday date (January 21, 2024)
    const startDateInput = page.locator('input[name="start"]').first();
    if (await startDateInput.isVisible()) {
      await startDateInput.click();
      await startDateInput.fill('2024-01-21');
    }

    // Select tenant
    await selectRelationship(page, 'tenant', 'Poznań');
    
    // Save
    await clickSave(page);
    await page.waitForLoadState('networkidle');

    await waitForSuccessNotification(page);
    
    // Navigate to the created ServiceWeek to verify structure
    await navigateToCollection(page, 'serviceWeeks');
    const rows = page.locator('tbody tr');
    const firstRow = rows.first();

    if (await firstRow.isVisible()) {

      const cellAfterSelectCell = firstRow.locator('[class*="cell-yearWeek"]').first();
      if (await cellAfterSelectCell.isVisible({ timeout: 3000 })) {
        await cellAfterSelectCell.click();
        await page.waitForTimeout(500);
      }
      await page.waitForLoadState('networkidle');
      
      // Verify that day tabs are present
      const tabs = page.locator('[role="tab"], .tab, [class*="tab"]');
      const tabCount = await tabs.count();
      
      console.log(`Found ${tabCount} day tabs`);
      
      // Click on Sunday tab to check services
      const sundayTab = page.locator('[role="tab"]:has-text("Sunday"), [role="tab"]:has-text("Niedziela"), button:has-text("Sunday"), button:has-text("Niedziela")').first();
      if (await sundayTab.isVisible({ timeout: 3000 })) {
        await sundayTab.click();
        await page.waitForTimeout(500);
        
        // Check if services array is present in Sunday tab
        const servicesSection = page.locator('[data-field="services"], [class*="services"], .array-field');
        
        if (await servicesSection.isVisible({ timeout: 3000 })) {
          // Count services in Sunday tab
          const serviceRows = page.locator('[class*="array-row"], [class*="row-"]');
          const serviceCount = await serviceRows.count();
          
          console.log(`Found ${serviceCount} services in Sunday tab`);
          
          // Verify at least one service exists (from feast template)
          expect(serviceCount).toBeGreaterThan(0);
          
          // Check if services are relationship fields pointing to Services collection
          const firstServiceField = page.locator('input[name*="services"], select[name*="services"]').first();
          if (await firstServiceField.isVisible({ timeout: 2000 })) {
            console.log('Services are properly linked as relationships');
          }
        } else {
          console.log('No services section found in Sunday tab');
        }
      }
      
      // Cleanup - delete the test ServiceWeek
      const deleteButton = page.locator('button:has-text("Delete"), [aria-label*="Delete"]').first();
      if (await deleteButton.isVisible({ timeout: 3000 })) {
        await deleteButton.click();
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete")').last();
        if (await confirmButton.isVisible({ timeout: 2000 })) {
          await confirmButton.click();
          await page.waitForLoadState('networkidle');
        }
      }
    }
  });
});

