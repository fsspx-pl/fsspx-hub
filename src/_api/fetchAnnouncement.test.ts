jest.mock('@payload-config', () => ({}), { virtual: true })
jest.mock('payload', () => ({
  getPayload: jest.fn(),
}))
jest.mock('date-fns', () => ({
  format: jest.fn(),
}))

import {
  fetchLatestAnnouncement,
  fetchTenantAnnouncementByDate,
  fetchAnnouncementById,
} from './fetchAnnouncement'
import { getPayload } from 'payload'
import { Announcement } from '@/payload-types'

const mockGetPayload = getPayload as jest.MockedFunction<typeof getPayload>

function createMockPayload(docs: Announcement[] = []) {
  return {
    find: jest.fn().mockResolvedValue({
      docs,
    }),
    findByID: jest.fn().mockResolvedValue(null),
  }
}

function setupMockPayload(mockPayload: ReturnType<typeof createMockPayload>) {
  mockGetPayload.mockResolvedValue(mockPayload as any)
  return mockPayload
}

function createMockAnnouncement(
  status: 'draft' | 'published' = 'published',
  overrides: Partial<{
    id: string
    content: any
    title: string
    tenant: string
    updatedAt: string
    createdAt: string
  }> = {},
) {
  return {
    id: overrides.id || 'test-announcement-id',
    _status: status,
    content: overrides.content ?? null,
    type: 'pastoral-announcements' as const,
    title: overrides.title || 'Test Announcement',
    tenant: overrides.tenant || 'tenant-id',
    updatedAt: overrides.updatedAt || '2024-01-01',
    createdAt: overrides.createdAt || '2024-01-01',
  }
}

function setupMockPayloadWithAnnouncement(
  mockAnnouncement: ReturnType<typeof createMockAnnouncement>,
) {
  const mockPayload = setupMockPayload(createMockPayload([mockAnnouncement as any]))
  return mockPayload
}

function expectFindByIdCalled(
  mockPayload: ReturnType<typeof createMockPayload>,
  announcementId: string,
) {
  expect(mockPayload.find).toHaveBeenCalledWith(
    expect.objectContaining({
      collection: 'announcements',
      where: { id: announcementId },
      depth: 2,
    }),
  )
}

describe('fetchAnnouncement', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('fetchLatestAnnouncement', () => {
    it('should combine domain filter with published status filter', async () => {
      const mockPayload = setupMockPayload(createMockPayload())
      await fetchLatestAnnouncement('subdomain')

      const callArgs = mockPayload.find.mock.calls[0][0]
      expect(callArgs.where['tenant.domain']).toEqual({
        contains: 'subdomain',
      })
      expect(callArgs.where._status).toEqual({ equals: 'published' })
    })
  })

  describe('fetchTenantAnnouncementByDate', () => {
    it('should combine domain, date, and published status filters', async () => {
      const mockPayload = setupMockPayload(createMockPayload())

      await fetchTenantAnnouncementByDate('subdomain', '2024-01-15')

      const callArgs = mockPayload.find.mock.calls[0][0]
      expect(callArgs.where['tenant.domain']).toEqual({
        contains: 'subdomain',
      })
      expect(callArgs.where['period.start']).toEqual({
        equals: '2024-01-15',
      })
      expect(callArgs.where._status).toEqual({ equals: 'published' })
    })

    it('should include drafts when includeDrafts is true', async () => {
      const mockPayload = setupMockPayload(createMockPayload())

      await fetchTenantAnnouncementByDate('subdomain', '2024-01-15', { includeDrafts: true })

      const callArgs = mockPayload.find.mock.calls[0][0]
      expect(callArgs.where['tenant.domain']).toEqual({
        contains: 'subdomain',
      })
      expect(callArgs.where['period.start']).toEqual({
        equals: '2024-01-15',
      })
      expect(callArgs.where._status).toBeUndefined()
    })
  })

  describe('fetchAnnouncementById', () => {
    it('should return draft announcements', async () => {
      const mockAnnouncement = createMockAnnouncement('draft')
      const mockPayload = setupMockPayloadWithAnnouncement(mockAnnouncement)

      const result = await fetchAnnouncementById('test-announcement-id')

      expectFindByIdCalled(mockPayload, 'test-announcement-id')
      expect(result).toEqual(mockAnnouncement)
    })

    it('should return published announcements', async () => {
      const mockAnnouncement = createMockAnnouncement('published')
      const mockPayload = setupMockPayloadWithAnnouncement(mockAnnouncement)

      const result = await fetchAnnouncementById('test-announcement-id')

      expectFindByIdCalled(mockPayload, 'test-announcement-id')
      expect(result).toEqual(mockAnnouncement)
    })

    it('should return undefined when announcement is not found', async () => {
      setupMockPayload(createMockPayload([]))

      const result = await fetchAnnouncementById('non-existent-id')

      expect(result).toBeUndefined()
    })
  })
})

