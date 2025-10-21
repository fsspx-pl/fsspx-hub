# E2E Tests with Playwright

This directory contains end-to-end tests for the FSSPX Hub application using Playwright.

## Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

3. **Set up test credentials:**
   Create a `.env` file in the project root with your admin credentials:
   ```bash
   # .env
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=your-password
   ```

   The `.env` file is automatically loaded by Playwright before tests run.

   Alternatively, you can set environment variables directly:
   ```bash
   export ADMIN_EMAIL="your-admin@example.com"
   export ADMIN_PASSWORD="your-admin-password"
   ```

## Running Tests

### All E2E tests
```bash
pnpm test:e2e
```

### With UI mode (interactive)
```bash
pnpm test:e2e:ui
```

### With headed browser (see what's happening)
```bash
pnpm test:e2e:headed
```

### Debug mode (step through tests)
```bash
pnpm test:e2e:debug
```

### Run specific test file
```bash
npx playwright test serviceWeeks.spec.ts
```

## Test Structure

### `serviceWeeks.spec.ts`
Tests for ServiceWeek creation and Service generation:
- **Test 1: Create ServiceWeek and verify Services are created**
  - Creates a new ServiceWeek
  - Verifies that Services are automatically generated
  - Checks that Services have correct dates
  - Cleans up by deleting the test data

- **Test 2: Verify timezone conversion**
  - Checks that service times are properly converted to/from Polish timezone
  - Validates date/time format

### Helper Files

- **`helpers/auth.ts`**: Authentication utilities (login, logout, session management)
- **`helpers/navigation.ts`**: Navigation helpers for PayloadCMS admin (navigate to collections, fill forms, etc.)

## Prerequisites

Before running E2E tests:

1. **Database must be running** (MongoDB)
2. **Application must have:**
   - At least one admin user with credentials matching ADMIN_EMAIL/ADMIN_PASSWORD
   - At least one Tenant configured with feast templates
   - Feast templates should have services configured for at least Sunday

3. **Dev server will be started automatically** by Playwright (configured in playwright.config.ts)

## Browser Configuration

The tests run with the following browser settings:
- **Locale**: English (en-US)
- **Timezone**: Europe/Warsaw (Polish timezone)
- **Browser**: Chromium (can be extended to Firefox/WebKit)

This ensures consistent test execution regardless of your system locale.

## What the Tests Verify

### ServiceWeek Creation Flow

1. ✅ ServiceWeek can be created through the admin UI
2. ✅ Services are automatically generated when ServiceWeek is created
3. ✅ Number of Services created matches expected count based on feast templates
4. ✅ Service dates are within the ServiceWeek date range
5. ✅ Services are deleted when ServiceWeek is deleted (afterDelete hook)
6. ✅ Timezone conversion works correctly (Polish time → UTC → Polish time)

## Troubleshooting

### Test fails at login
- Verify ADMIN_EMAIL and ADMIN_PASSWORD are correct
- Check that admin user exists in database
- Ensure dev server is running on http://localhost:3000

### Services not created
- Check that the selected Tenant has feast templates configured
- Verify feast templates have services defined
- Check server logs for errors during ServiceWeek creation
- Look at the database to see if Services were created but not showing in UI

### Timeouts
- Increase timeout in playwright.config.ts
- Check if Next.js dev server is slow to start
- Verify network connection

## Debugging

To debug a failing test:

1. **Run in debug mode:**
   ```bash
   pnpm test:e2e:debug
   ```

2. **Check screenshots:**
   - Failed tests automatically capture screenshots
   - Located in `test-results/` directory

3. **Check videos:**
   - Failed tests record videos
   - Located in `test-results/` directory

4. **View trace:**
   - Traces are captured on first retry
   - Open with: `npx playwright show-trace test-results/.../trace.zip`

## CI/CD Integration

To run E2E tests in CI:

```bash
# Set environment variables
export ADMIN_EMAIL=admin@example.com
export ADMIN_PASSWORD=test-password
export CI=true

# Run tests
pnpm test:e2e
```

The `CI=true` environment variable enables:
- Stricter test validation (fails if test.only is present)
- Test retries (2 retries on CI)
- Sequential test execution

## Coverage

Current E2E test coverage:
- ✅ ServiceWeek creation
- ✅ Service auto-generation
- ✅ Timezone handling
- ✅ Cleanup (afterDelete hook)
- ⏳ Confirmation dialog (to be added)
- ⏳ Individual day templates (to be added)

