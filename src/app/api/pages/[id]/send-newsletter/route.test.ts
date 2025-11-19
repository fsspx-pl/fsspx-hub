jest.mock('@payload-config', () => ({}), { virtual: true });
jest.mock('payload', () => ({
  getPayload: jest.fn(),
}));
jest.mock('@/_api/fetchGlobals');
jest.mock('@/common/getFeastsWithMasses');
jest.mock('@/_components/RichText/serialize');
jest.mock('@/utilities/awsSes', () => ({
  sendBulkEmail: jest.fn(),
}));
jest.mock('@/utilities/nodemailerSes');
jest.mock('@react-email/components');
jest.mock('html-minifier-terser');
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    nextUrl: URL;
    constructor(url: string) {
      this.nextUrl = new URL(url);
    }
  },
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
    })),
  },
}));

import { POST } from './route';
import { NextRequest } from 'next/server';
import { getPayload } from 'payload';
import { fetchFooter, fetchSettings } from '@/_api/fetchGlobals';
import { getFeastsWithMasses } from '@/common/getFeastsWithMasses';
import { serialize } from '@/_components/RichText/serialize';
import { sendEmail } from '@/utilities/nodemailerSes';
import { render } from '@react-email/components';
import { minify } from 'html-minifier-terser';

const mockGetPayload = getPayload as jest.MockedFunction<typeof getPayload>;
const mockFetchFooter = fetchFooter as jest.MockedFunction<typeof fetchFooter>;
const mockFetchSettings = fetchSettings as jest.MockedFunction<typeof fetchSettings>;
const mockGetFeastsWithMasses = getFeastsWithMasses as jest.MockedFunction<typeof getFeastsWithMasses>;
const mockSerialize = serialize as jest.MockedFunction<typeof serialize>;
const mockSendEmail = sendEmail as jest.MockedFunction<typeof sendEmail>;
const mockRender = render as jest.MockedFunction<typeof render>;
const mockMinify = minify as jest.MockedFunction<typeof minify>;

describe('POST /api/pages/[id]/send-newsletter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchFooter.mockResolvedValue({ slogan: 'Test Slogan' } as any);
    mockFetchSettings.mockResolvedValue({ copyright: 'Test Copyright' } as any);
    mockGetFeastsWithMasses.mockResolvedValue([]);
    mockSerialize.mockReturnValue([]);
    mockRender.mockResolvedValue('<html>test</html>');
    mockMinify.mockResolvedValue('<html>test</html>');
    mockSendEmail.mockResolvedValue({ messageId: 'test-message-id' } as any);
  });

  it('should call getPage with depth: 2 when fetching page', async () => {
    const mockPayload = {
      findByID: jest.fn().mockResolvedValue({
        id: 'test-id',
        type: 'pastoral-announcements',
        title: 'Test Page',
        period: { start: '2024-01-01' },
        tenant: {
          type: 'Parish',
          patron: 'St. John',
          city: 'Warsaw',
          address: { email: 'test@example.com' },
          mailingGroupId: 'test-group',
          topicName: 'test-topic',
        },
        content: { root: { children: [] } },
        newsletter: { sent: false },
      }),
      update: jest.fn().mockResolvedValue({}),
    };

    mockGetPayload.mockResolvedValue(mockPayload as any);

    const params = Promise.resolve({ id: 'test-id' });

    await POST({ nextUrl: new URL('http://localhost:3000/api/pages/test-id/send-newsletter?testEmail=test@example.com') } as NextRequest, { params });

    expect(mockPayload.findByID).toHaveBeenCalledWith({
      collection: 'pages',
      id: 'test-id',
      depth: 2,
    });
  });
});

