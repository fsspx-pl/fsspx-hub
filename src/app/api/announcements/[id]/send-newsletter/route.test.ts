jest.mock('@payload-config', () => ({}), { virtual: true })
jest.mock('payload', () => ({
  getPayload: jest.fn(),
}))
jest.mock('@/_api/fetchGlobals')
jest.mock('@/common/getFeastsWithMasses')
jest.mock('@/_components/RichText/serialize')
jest.mock('@/utilities/awsSes', () => ({
  sendBulkEmailToRecipients: jest.fn(),
}))
jest.mock('@/utilities/nodemailerSes')
jest.mock('@react-email/components')
jest.mock('html-minifier-terser')
jest.mock('@payloadcms/richtext-lexical/shared', () => ({
  hasText: jest.fn(),
}))
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    nextUrl: URL
    constructor(url: string) {
      this.nextUrl = new URL(url)
    }
  },
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
    })),
  },
}))

import { POST } from './route'
import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import { fetchFooter, fetchSettings } from '@/_api/fetchGlobals'
import { getFeastsWithMasses } from '@/common/getFeastsWithMasses'
import { serializeForEmail } from '@/_components/RichText/serialize'
import { sendEmail } from '@/utilities/nodemailerSes'
import { render } from '@react-email/components'
import { minify } from 'html-minifier-terser'
import { hasText } from '@payloadcms/richtext-lexical/shared'

const mockGetPayload = getPayload as jest.MockedFunction<typeof getPayload>
const mockFetchFooter = fetchFooter as jest.MockedFunction<typeof fetchFooter>
const mockFetchSettings = fetchSettings as jest.MockedFunction<typeof fetchSettings>
const mockGetFeastsWithMasses = getFeastsWithMasses as jest.MockedFunction<typeof getFeastsWithMasses>
const mockSerializeForEmail = serializeForEmail as jest.MockedFunction<typeof serializeForEmail>
const mockSendEmail = sendEmail as jest.MockedFunction<typeof sendEmail>
const mockRender = render as jest.MockedFunction<typeof render>
const mockMinify = minify as jest.MockedFunction<typeof minify>
const mockHasText = hasText as jest.MockedFunction<typeof hasText>

const baseTenant = {
  id: 'tenant-id',
  type: 'Parish',
  patron: 'St. John',
  city: 'Warsaw',
  address: { email: 'test@example.com' },
  mailingGroupId: 'test-group',
  topicName: 'test-topic',
}

const baseAnnouncement = {
  id: 'test-id',
  type: 'pastoral-announcements',
  title: 'Test Announcement',
  period: { start: '2024-01-01' },
  newsletter: { sent: false },
}

function createMockTenant(overrides: Partial<typeof baseTenant> = {}) {
  return { ...baseTenant, ...overrides }
}

function createMockAnnouncement(content: any, overrides: Partial<typeof baseAnnouncement> = {}) {
  return {
    ...baseAnnouncement,
    tenant: createMockTenant(),
    content,
    ...overrides,
  }
}

function createMockPayload(announcement: any) {
  return {
    findByID: jest.fn().mockResolvedValue(announcement),
    update: jest.fn().mockResolvedValue({}),
    find: jest.fn().mockResolvedValue({ docs: [] }),
  }
}

function createMockRequest(
  url = 'http://localhost:3000/api/announcements/test-id/send-newsletter',
  locale = 'en',
) {
  return {
    nextUrl: new URL(url),
    headers: {
      get: jest.fn((header: string) => {
        if (header === 'cookie') return `payload-lng=${locale}`
        return null
      }),
    },
  } as unknown as NextRequest
}

function createMockParams(id = 'test-id') {
  return Promise.resolve({ id })
}

describe('POST /api/announcements/[id]/send-newsletter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetchFooter.mockResolvedValue({ slogan: 'Test Slogan' } as any)
    mockFetchSettings.mockResolvedValue({ copyright: 'Test Copyright' } as any)
    mockGetFeastsWithMasses.mockResolvedValue([])
    mockSerializeForEmail.mockReturnValue([])
    mockRender.mockResolvedValue('<html>test</html>')
    mockMinify.mockResolvedValue('<html>test</html>')
    mockSendEmail.mockResolvedValue({ messageId: 'test-message-id' } as any)
    mockHasText.mockReturnValue(true)
  })

  it('should call getAnnouncement with depth: 2 when fetching announcement', async () => {
    const announcement = createMockAnnouncement({ root: { children: [] } })
    const mockPayload = createMockPayload(announcement)

    mockGetPayload.mockResolvedValue(mockPayload as any)

    const params = createMockParams()
    const request = createMockRequest(
      'http://localhost:3000/api/announcements/test-id/send-newsletter?testEmail=test@example.com',
    )

    await POST(request, { params })

    expect(mockPayload.findByID).toHaveBeenCalledWith({
      collection: 'announcements',
      id: 'test-id',
      depth: 2,
      draft: true,
    })
  })

  describe('Content validation', () => {
    let params: Promise<{ id: string }>
    let request: NextRequest

    beforeEach(() => {
      params = createMockParams()
      request = createMockRequest('http://localhost:3000/api/announcements/test-id/send-newsletter')
    })

    const expectNoContentError = async (content: any) => {
      const announcement = createMockAnnouncement(content)
      const mockPayload = createMockPayload(announcement)

      mockGetPayload.mockResolvedValue(mockPayload as any)
      mockHasText.mockReturnValue(false)

      const response = await POST(request, { params })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.message).toBe('Cannot send newsletter: Announcement has no content')
    }

    it('should return 400 when announcement has no content (null)', async () => {
      await expectNoContentError(null)
    })

    it('should return 400 when announcement has no content (undefined)', async () => {
      await expectNoContentError(undefined)
    })

    it('should return 400 when announcement content has empty children array', async () => {
      await expectNoContentError({ root: { children: [] } })
    })

    it('should return 400 when announcement content has no root', async () => {
      await expectNoContentError({})
    })

    it('should return 400 when announcement content has no children', async () => {
      await expectNoContentError({ root: {} })
    })
  })
})

