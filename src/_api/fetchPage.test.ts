jest.mock('@payload-config', () => ({}), { virtual: true });
jest.mock('payload', () => ({
  getPayload: jest.fn(),
}));
jest.mock('date-fns', () => ({
  format: jest.fn(),
}));

import { fetchLatestPage, fetchTenantPageByDate } from './fetchPage';
import { getPayload } from 'payload';
import { Page } from '@/payload-types';

const mockGetPayload = getPayload as jest.MockedFunction<typeof getPayload>;

function createMockPayload(docs: Page[] = []) {
  return {
    find: jest.fn().mockResolvedValue({
      docs,
    }),
  };
}

function setupMockPayload(mockPayload: ReturnType<typeof createMockPayload>) {
  mockGetPayload.mockResolvedValue(mockPayload as any);
  return mockPayload;
}

describe('fetchPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchLatestPage', () => {
    it('should combine domain filter with published status filter', async () => {
      const mockPayload = setupMockPayload(createMockPayload());
      await fetchLatestPage('subdomain');

      const callArgs = mockPayload.find.mock.calls[0][0];
      expect(callArgs.where['tenant.domain']).toEqual({
        contains: 'subdomain',
      });
      expect(callArgs.where._status).toEqual({ equals: 'published' });
    });
  });

    it('should combine domain, date, and published status filters', async () => {
      const mockPayload = setupMockPayload(createMockPayload());

      await fetchTenantPageByDate('subdomain', '2024-01-15');

      const callArgs = mockPayload.find.mock.calls[0][0];
      expect(callArgs.where['tenant.domain']).toEqual({
        contains: 'subdomain',
      });
      expect(callArgs.where['period.start']).toEqual({
        equals: '2024-01-15',
      });
      expect(callArgs.where._status).toEqual({ equals: 'published' });
    });
});

