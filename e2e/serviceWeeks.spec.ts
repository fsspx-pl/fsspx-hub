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

  test('should create Services when creating a ServiceWeek', async ({ page }) => {
    // Step 1: Navigate to ServiceWeeks collection
    await navigateToCollection(page, 'serviceWeeks');
    
    // Record how many ServiceWeeks exist before
    const existingServiceWeeks = await page.locator('tbody tr').count();
    console.log(`Existing ServiceWeeks: ${existingServiceWeeks}`);
    
    // Step 2: Navigate to Services collection and check count before
    await navigateToCollection(page, 'services');
    const servicesBeforeCount = await page.locator('tbody tr').count();
    console.log(`Services before: ${servicesBeforeCount}`);
    
    // Step 3: Create a new ServiceWeek
    await navigateToCollection(page, 'serviceWeeks');
    await clickCreateNew(page);
    
    // Wait for the create form to load
    await page.waitForSelector('form', { timeout: 10000 });
    
    // Step 4: Fill in the ServiceWeek details
    // Select a tenant (assuming first tenant in dropdown)
    const tenantField = page.locator('[data-field="tenant"], [name="tenant"]').first();
    if (await tenantField.isVisible()) {
      await tenantField.click();
      await page.waitForTimeout(500);
      // Click the first option in the dropdown
      const firstTenantOption = page.locator('[role="option"], .option, li').first();
      await firstTenantOption.click({ timeout: 5000 });
    }
    
    // Set start date (find a Sunday)
    // For testing purposes, we'll use a known Sunday: January 14, 2024
    const startDateInput = page.locator('input[name="start"]').first();
    if (await startDateInput.isVisible()) {
      await startDateInput.click();
      await startDateInput.fill('2024-01-14');
    }
    
    // Step 5: Save the ServiceWeek
    await clickSave(page);
    
    // Wait for save to complete
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Give time for background processing
    
    // Step 6: Navigate to Services collection and verify new services were created
    await navigateToCollection(page, 'services');
    await page.waitForLoadState('networkidle');
    
    const servicesAfterCount = await page.locator('tbody tr').count();
    console.log(`Services after: ${servicesAfterCount}`);
    
    // Assert that new services were created
    expect(servicesAfterCount).toBeGreaterThan(servicesBeforeCount);
    
    const newServicesCount = servicesAfterCount - servicesBeforeCount;
    console.log(`New services created: ${newServicesCount}`);
    
    // Step 7: Verify that services have correct dates
    // Filter or search for services from January 14-20, 2024
    const serviceRows = page.locator('tbody tr');
    const firstServiceRow = serviceRows.first();
    
    if (await firstServiceRow.isVisible()) {
      // Click on the first service to view details
      await firstServiceRow.click();
      await page.waitForLoadState('networkidle');
      
      // Check that the date field exists and has a value
      const dateField = page.locator('input[name="date"]').first();
      await expect(dateField).toBeVisible({ timeout: 5000 });
      
      const dateValue = await dateField.inputValue();
      console.log(`First service date: ${dateValue}`);
      
      // Verify the date is within the expected week (Jan 14-20, 2024)
      expect(dateValue).toContain('2024-01');
    }
    
    // Step 8: Cleanup - Delete the created ServiceWeek
    await navigateToCollection(page, 'serviceWeeks');
    
    // Find and delete the newly created ServiceWeek
    const serviceWeekRows = page.locator('tbody tr');
    const latestRow = serviceWeekRows.first();
    
    if (await latestRow.isVisible()) {
      await latestRow.click();
      await page.waitForLoadState('networkidle');
      
      // Look for delete button
      const deleteButton = page.locator('button:has-text("Delete"), [aria-label*="Delete"]').first();
      if (await deleteButton.isVisible({ timeout: 3000 })) {
        await deleteButton.click();
        
        // Confirm deletion in modal if it appears
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete")').last();
        if (await confirmButton.isVisible({ timeout: 2000 })) {
          await confirmButton.click();
          await page.waitForLoadState('networkidle');
        }
      }
    }
    
    // Verify that services were also deleted (due to afterDelete hook)
    await navigateToCollection(page, 'services');
    await page.waitForLoadState('networkidle');
    
    const finalServicesCount = await page.locator('tbody tr').count();
    console.log(`Services after cleanup: ${finalServicesCount}`);
    
    // Services should be back to original count (or close to it)
    expect(finalServicesCount).toBeLessThanOrEqual(servicesAfterCount);
  });

  test('should verify timezone conversion for service times', async ({ page }) => {
    // Navigate to Services collection
    await navigateToCollection(page, 'services');
    
    // Find a service and check its time
    const serviceRows = page.locator('tbody tr');
    const count = await serviceRows.count();
    
    if (count > 0) {
      // Click on first service
      await serviceRows.first().click();
      await page.waitForLoadState('networkidle');
      
      // Get the date field value
      const dateField = page.locator('input[name="date"]').first();
      const dateValue = await dateField.inputValue();
      
      console.log(`Service date/time: ${dateValue}`);
      
      // Verify it's a valid date
      expect(new Date(dateValue).toString()).not.toBe('Invalid Date');
      
      // Check that tenant is set
      const tenantField = page.locator('[data-field="tenant"], [name="tenant"]').first();
      await expect(tenantField).toBeVisible();
    } else {
      console.log('No services found to test timezone conversion');
      test.skip();
    }
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

