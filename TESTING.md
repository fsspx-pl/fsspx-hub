# Testing Documentation

This document describes the testing setup and test coverage for the FSSPX Hub project.

## Testing Stack

The project uses two types of tests:
1. **Unit & Integration Tests** - Jest
2. **End-to-End Tests** - Playwright

## Setup

### Running Tests

**Unit/Integration Tests (Jest):**
```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage
```

**End-to-End Tests (Playwright):**
```bash
# Run all E2E tests
pnpm test:e2e

# Run E2E tests with UI (interactive mode)
pnpm test:e2e:ui

# Run E2E tests with visible browser
pnpm test:e2e:headed

# Debug E2E tests (step-by-step)
pnpm test:e2e:debug
```

### Playwright Configuration

Playwright is configured to:
- Run tests against configured base URL
- Automatically start dev server before tests
- Load environment variables from `.env` file (using dotenv)
- Capture screenshots and videos on failure
- Record traces for debugging failed tests
- Run tests in Chromium browser (can be extended to Firefox/WebKit)

**Environment Setup:**
Create a `.env` file in the project root:
```bash
ADMIN_EMAIL=your-admin@example.com
ADMIN_PASSWORD=your-password
```

See `playwright.config.ts` for full configuration, `e2e/README.md` for detailed E2E testing guide, and `ENV_SETUP.md` for environment variables setup.

### Jest Configuration

The project uses Jest with the following setup:

- **Test Environment**: `jsdom` (for DOM-related tests)
- **Coverage Provider**: `v8`
- **Path Mappings**: Configured to match TypeScript paths (`@/` maps to `src/`)
- **Setup File**: `jest.setup.ts` - Configures test environment and mocks

### Installing Dependencies

If you need to install the testing dependencies:

```bash
pnpm install
```

This will install:
- `jest` - Testing framework
- `ts-jest` - TypeScript support for Jest
- `ts-node` - Required for Jest to parse TypeScript config files
- `@testing-library/jest-dom` - Custom Jest matchers for DOM
- `@testing-library/react` - React testing utilities
- `@types/jest` - TypeScript type definitions for Jest
- `jest-environment-jsdom` - DOM environment for tests

## Test Files

### End-to-End Tests

#### `e2e/serviceWeeks.spec.ts`

End-to-end tests for ServiceWeeks functionality using real browser automation.

**Coverage:**
- ✅ ServiceWeek creation through admin UI
- ✅ Automatic Service generation verification
- ✅ Service count validation
- ✅ Service date range verification
- ✅ Cleanup (afterDelete hook) validation
- ✅ Timezone conversion end-to-end testing

**Key Test Cases:**
1. **Complete ServiceWeek creation flow**
   - Login to admin
   - Create new ServiceWeek
   - Verify Services are auto-created
   - Verify Service dates are correct
   - Delete ServiceWeek
   - Verify Services are also deleted

2. **Timezone conversion verification**
   - Check service times in UI
   - Validate Polish timezone → UTC conversion
   - Verify dates display correctly

#### Helper Modules

**`e2e/helpers/auth.ts`:**
- `loginToAdmin()` - Authenticate to PayloadCMS admin
- `logoutFromAdmin()` - Logout from admin
- `isLoggedIn()` - Check authentication status

**`e2e/helpers/navigation.ts`:**
- `navigateToCollection()` - Navigate to collection pages
- `clickCreateNew()` - Start creating new item
- `fillField()` - Fill form fields
- `selectRelationship()` - Select related items
- `clickSave()` - Submit forms
- `waitForSuccessNotification()` - Wait for success feedback

### Unit & Integration Tests

#### Timezone Utilities Tests (`src/common/timezone.test.ts`)

Tests for timezone conversion utilities used throughout the application.

**Coverage:**
- ✅ `createPolishDate` - Converting Polish local time to UTC
- ✅ `formatInPolishTime` - Formatting dates in Polish timezone
- ✅ `polishTimeToUtc` - Converting Polish time to UTC
- ✅ DST (Daylight Saving Time) transitions
- ✅ Round-trip conversions (UTC → Polish → UTC)
- ✅ Edge cases (midnight, noon, end of day)

**Key Test Cases:**
1. Winter time conversion (UTC+1)
2. Summer time conversion (UTC+2)
3. DST spring forward transition
4. DST fall back transition
5. Date formatting with Polish locale
6. Round-trip consistency

### ServiceWeeks Collection Tests (`src/collections/ServiceWeeks.test.ts`)

Tests for the ServiceWeeks collection, focusing on the service creation logic that was fixed.

**Coverage:**
- ✅ Timezone conversion in service creation
- ✅ Template matching based on `applicableDays`
- ✅ Service data structure validation
- ✅ Multiple services per feast
- ✅ Error handling for invalid time formats
- ✅ Edge cases and boundary conditions

**Key Test Cases:**

#### Timezone Conversion
- Correctly converts Polish time to UTC when creating services
- Handles DST transitions properly
- Validates the fix for the original bug (using `createPolishDate`)

#### Template Matching
- Selects correct template for Sunday (day 0)
- Selects correct template for weekdays (days 1-6)
- Handles missing templates gracefully
- Handles overlapping template days (first match wins)

#### Service Creation
- Includes all required fields (tenant, date, category, massType, notes)
- Handles optional fields correctly
- Logs errors when service creation fails
- Filters out null services

#### Edge Cases
- Invalid time formats (rejected properly)
- Empty feast templates
- Templates without services
- Multiple services for single feast
- DST boundary crossings

### Existing Tests

#### `src/utilities/generateExcerpt.test.ts`

Tests for the announcement excerpt generation utility.

## Bug Fix Documentation

### Issue: Services Not Being Created

**Problem:** When creating ServiceWeeks, the associated Services were not being created due to incorrect timezone handling in the `createServicesForFeast` function.

**Root Cause:** 
The original implementation used manual timezone conversion:
```typescript
const serviceDate = new Date(`${polishDate}T${hours}:${minutes}:00`);
const utcDate = new Date(serviceDate.getTime() - serviceDate.getTimezoneOffset() * 60000);
```

This approach was problematic because:
1. Creating a date from a string without timezone info is ambiguous
2. `getTimezoneOffset()` returns the offset for the JavaScript runtime, not the Polish timezone
3. It didn't account for DST transitions properly

**Solution:**
Use the existing `createPolishDate` utility which properly handles timezone conversion using `date-fns-tz`:

```typescript
// Get the date components from the feast date in Polish timezone
const polishDateStr = formatInPolishTime(feast.date, 'yyyy-MM-dd');
const [year, month, day] = polishDateStr.split('-').map(Number);

// Use createPolishDate to properly handle timezone conversion
const serviceDate = createPolishDate(year, month, day, hours, minutes);
```

**Files Changed:**
- `/src/collections/ServiceWeeks.ts` - Fixed `createServicesForFeast` function
  - Line 4: Added `createPolishDate` import
  - Lines 98-103: Replaced manual timezone conversion with `createPolishDate`

**Tests Added:**
- Timezone conversion tests in `src/common/timezone.test.ts`
- Service creation tests in `src/collections/ServiceWeeks.test.ts`
- DST handling tests
- Edge case coverage

## Coverage Goals

The test suite aims for:
- ✅ **Critical Path Coverage**: All timezone-related utilities
- ✅ **Bug Prevention**: Tests specifically for the fixed bug
- ✅ **Edge Cases**: DST transitions, invalid inputs, boundary conditions
- ✅ **Integration**: Full hook execution with mocked dependencies

## Running Specific Tests

```bash
# Run only timezone tests
pnpm test timezone

# Run only ServiceWeeks tests
pnpm test ServiceWeeks

# Run tests matching a pattern
pnpm test -- -t "DST"
```

## Continuous Integration

The test suite should be run in CI before merging:

```bash
# In CI pipeline
pnpm test:coverage
```

This ensures:
1. All tests pass
2. Coverage thresholds are met
3. No regressions are introduced

## Future Test Coverage

Consider adding tests for:
- [ ] Complete integration tests for ServiceWeeks hooks
- [ ] E2E tests for service creation flow
- [ ] Performance tests for bulk service creation
- [ ] Tests for the `findTemplateForFeast` function
- [ ] Tests for the `afterDelete` hook (service cleanup)

