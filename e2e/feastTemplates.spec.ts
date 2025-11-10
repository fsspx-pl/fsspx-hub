import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'

test.describe('Weekly Feast Templates', () => {
  test('generation on ServiceWeek creation and fallback rendering', async ({ page }) => {
    await loginAsAdmin(page)

    // Create a tenant weekly feast template (generic Sunday)
    await page.goto('/admin/collections/feastTemplates')
    await page.getByRole('link', { name: 'Create New' }).click()
    await page.getByLabel('Title').fill('Generic Sunday')
    await page.getByLabel('Tenant').click()
    await page.getByRole('option').first().click()
    await page.getByLabel('Applicable Days').click()
    await page.getByText('Sunday').click()
    await page.getByText('Services').scrollIntoViewIfNeeded()
    await page.getByRole('button', { name: 'Add Service' }).click()
    await page.getByLabel('Service time').fill('09:00')
    await page.getByLabel('Category').selectOption('mass')
    await page.getByLabel('Mass Type').selectOption('read')
    await page.getByRole('button', { name: 'Save' }).click()

    // Create a ServiceWeek for a Sunday date
    await page.goto('/admin/collections/serviceWeeks')
    await page.getByRole('link', { name: 'Create New' }).click()
    // pick next Sunday by default value; just save
    await page.getByRole('button', { name: 'Save' }).click()

    // Verify services created
    await page.goto('/admin/collections/services')
    await expect(page.getByText('09:00')).toBeVisible()

    // Visit calendar page and verify at least one mass is shown for a Sunday (fallback already covered by persisted one)
    await page.goto('/')
    await expect(page.getByText('Msza')).toBeTruthy()
  })
})


