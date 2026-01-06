jest.mock('@payload-config', () => ({}), { virtual: true });
jest.mock('payload', () => ({
  getPayload: jest.fn(),
}));
jest.mock('date-fns', () => ({
  format: jest.fn(),
}));

import { fetchLatestPage, fetchTenantPageByDate, fetchPageById } from './fetchPage';
import { getPayload } from 'payload';
import { Page } from '@/payload-types';

const mockGetPayload = getPayload as jest.MockedFunction<typeof getPayload>;

function createMockPayload(docs: Page[] = []) {
  return {
    find: jest.fn().mockResolvedValue({
      docs,
    }),
    findByID: jest.fn().mockResolvedValue(null),
  };
}

function setupMockPayload(mockPayload: ReturnType<typeof createMockPayload>) {
  mockGetPayload.mockResolvedValue(mockPayload as any);
  return mockPayload;
}

function createMockPage(
  status: 'draft' | 'published' = 'published',
  overrides: Partial<{
    id: string;
    content: any;
    title: string;
    tenant: string;
    updatedAt: string;
    createdAt: string;
  }> = {}
) {
  return {
    id: overrides.id || 'test-page-id',
    _status: status,
    content: overrides.content ?? null,
    type: 'pastoral-announcements' as const,
    title: overrides.title || 'Test Page',
    tenant: overrides.tenant || 'tenant-id',
    updatedAt: overrides.updatedAt || '2024-01-01',
    createdAt: overrides.createdAt || '2024-01-01',
  };
}

function setupMockPayloadWithPage(mockPage: ReturnType<typeof createMockPage>) {
  const mockPayload = setupMockPayload(createMockPayload());
  mockPayload.findByID.mockResolvedValue(mockPage as any);
  return mockPayload;
}

function expectFindByIDCalled(mockPayload: ReturnType<typeof createMockPayload>, pageId: string) {
  expect(mockPayload.findByID).toHaveBeenCalledWith({
    collection: 'pages',
    id: pageId,
    depth: 2,
  });
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

  describe('fetchTenantPageByDate', () => {
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

    it('should include drafts when includeDrafts is true', async () => {
      const mockPayload = setupMockPayload(createMockPayload());

      await fetchTenantPageByDate('subdomain', '2024-01-15', { includeDrafts: true });

      const callArgs = mockPayload.find.mock.calls[0][0];
      expect(callArgs.where['tenant.domain']).toEqual({
        contains: 'subdomain',
      });
      expect(callArgs.where['period.start']).toEqual({
        equals: '2024-01-15',
      });
      expect(callArgs.where._status).toBeUndefined();
    });
  });

  describe('fetchPageById', () => {
    it('should return draft pages', async () => {
      const mockPage = createMockPage('draft');
      const mockPayload = setupMockPayloadWithPage(mockPage);

      const result = await fetchPageById('test-page-id');

      expectFindByIDCalled(mockPayload, 'test-page-id');
      expect(result).toEqual(mockPage);
    });

    it('should return published pages', async () => {
      const mockPage = createMockPage('published');
      const mockPayload = setupMockPayloadWithPage(mockPage);

      const result = await fetchPageById('test-page-id');

      expectFindByIDCalled(mockPayload, 'test-page-id');
      expect(result).toEqual(mockPage);
    });

    it('should return undefined when page is not found', async () => {
      const mockPayload = setupMockPayload(createMockPayload());
      mockPayload.findByID.mockRejectedValue(new Error('Not found'));

      const result = await fetchPageById('non-existent-id');

      expect(result).toBeUndefined();
    });
  });
});

