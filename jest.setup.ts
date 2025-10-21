import '@testing-library/jest-dom';

// Mock Next.js cache functions that are not available in test environment
jest.mock('next/cache', () => ({
  revalidateTag: jest.fn(),
  unstable_cache: jest.fn((fn) => fn),
}));

// Set timezone to UTC for consistent test results
process.env.TZ = 'UTC';

