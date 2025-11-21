jest.mock('@payload-config', () => ({}), { virtual: true });
jest.mock('payload', () => ({
  getPayload: jest.fn(),
}));
jest.mock('@/_api/fetchTenants');
jest.mock('@/_api/fetchGlobals');
jest.mock('@/utilities/awsSes', () => ({
  addContactToList: jest.fn(),
  contactExistsInList: jest.fn(),
}));
jest.mock('@/utilities/nodemailerSes', () => ({
  sendEmail: jest.fn(),
}));
jest.mock('@react-email/components', () => ({
  render: jest.fn(),
}));
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    headers: Headers;
    json: jest.Mock;
    constructor(url: string) {
      this.headers = new Headers();
      this.headers.set('host', new URL(url).host);
      this.json = jest.fn();
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
import { fetchTenant } from '@/_api/fetchTenants';
import { fetchSettings } from '@/_api/fetchGlobals';
import { contactExistsInList } from '@/utilities/awsSes';
import { sendEmail } from '@/utilities/nodemailerSes';
import { render } from '@react-email/components';

const mockGetPayload = getPayload as jest.MockedFunction<typeof getPayload>;
const mockFetchTenant = fetchTenant as jest.MockedFunction<typeof fetchTenant>;
const mockFetchSettings = fetchSettings as jest.MockedFunction<typeof fetchSettings>;
const mockContactExistsInList = contactExistsInList as jest.MockedFunction<typeof contactExistsInList>;
const mockSendEmail = sendEmail as jest.MockedFunction<typeof sendEmail>;
const mockRender = render as jest.MockedFunction<typeof render>;

// Mock environment variables
const originalEnv = process.env;

// Helper function to create a mock request with JSON body
function createMockRequest(body: any, url = 'http://localhost:3000/api/newsletter/subscribe'): NextRequest {
  const request = new NextRequest(url);
  const mockJson = jest.fn().mockResolvedValue(body);
  request.json = mockJson;
  return request;
}

// Helper function to create a mock tenant
function createMockTenant(overrides: Partial<any> = {}) {
  return {
    id: 'tenant-id',
    mailingGroupId: 'test-group',
    topicName: 'test-topic',
    type: 'Parish',
    patron: 'St. John',
    city: 'Warsaw',
    ...overrides,
  };
}

// Helper function to create a mock subscription
function createMockSubscription(overrides: Partial<any> = {}) {
  return {
    id: 'sub-id',
    email: 'test@example.com',
    status: 'pending',
    tenant: 'tenant-id',
    ...overrides,
  };
}

describe('POST /api/newsletter/subscribe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      NODE_ENV: 'development', // Use development to skip Turnstile validation
      FROM_ADDRESS: 'test@example.com',
      FROM_NAME: 'Test',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
    };
    mockFetchSettings.mockResolvedValue({ copyright: 'Test Copyright' } as any);
    mockRender.mockResolvedValue('<html>test</html>');
    mockSendEmail.mockResolvedValue({ messageId: 'test-message-id' } as any);
    mockContactExistsInList.mockResolvedValue(false);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Validation', () => {
    it('should return 400 if email is missing', async () => {
      const request = createMockRequest({ subdomain: 'test' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required fields');
    });

    it('should return 400 if subdomain is missing', async () => {
      const request = createMockRequest({ email: 'test@example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required fields');
    });

    it('should return 400 if email format is invalid', async () => {
      const request = createMockRequest({
        email: 'invalid-email',
        subdomain: 'test',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid email format');
    });

    it('should return 404 if tenant is not found', async () => {
      const request = createMockRequest({
        email: 'test@example.com',
        subdomain: 'nonexistent',
      });

      mockFetchTenant.mockResolvedValue(undefined as any);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Tenant not found');
      expect(mockFetchTenant).toHaveBeenCalledWith('nonexistent');
    });

    it('should return 400 if tenant has no newsletter settings', async () => {
      const request = createMockRequest({
        email: 'test@example.com',
        subdomain: 'test',
      });

      mockFetchTenant.mockResolvedValue(
        createMockTenant({ mailingGroupId: null, topicName: null }) as any
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Newsletter settings not configured for this tenant');
    });
  });

  describe('Existing subscriptions', () => {
    it('should return alreadyExists if subscription is confirmed in Payload', async () => {
      const request = createMockRequest({
        email: 'test@example.com',
        subdomain: 'test',
      });

      const mockPayload = {
        find: jest.fn().mockResolvedValue({
          docs: [createMockSubscription({ status: 'confirmed' })],
        }),
      };

      mockGetPayload.mockResolvedValue(mockPayload as any);
      mockFetchTenant.mockResolvedValue(createMockTenant() as any);

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.alreadyExists).toBe(true);
      expect(data.redirectUrl).toContain('/newsletter/already-subscribed');
    });

    it('should return alreadyExists if contact exists in AWS SES', async () => {
      const request = createMockRequest({
        email: 'test@example.com',
        subdomain: 'test',
      });

      const mockPayload = {
        find: jest.fn().mockResolvedValue({
          docs: [],
        }),
      };

      mockGetPayload.mockResolvedValue(mockPayload as any);
      mockFetchTenant.mockResolvedValue(createMockTenant() as any);
      mockContactExistsInList.mockResolvedValue(true);

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.alreadyExists).toBe(true);
      expect(data.redirectUrl).toContain('/newsletter/already-subscribed');
    });

    it('should reuse existing pending subscription', async () => {
      const request = createMockRequest({
        email: 'test@example.com',
        subdomain: 'test',
      });

      const existingSubscription = createMockSubscription({ status: 'pending' });
      const mockPayload = {
        find: jest.fn().mockResolvedValue({
          docs: [existingSubscription],
        }),
      };

      mockGetPayload.mockResolvedValue(mockPayload as any);
      mockFetchTenant.mockResolvedValue(createMockTenant() as any);

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(mockPayload.find).toHaveBeenCalled();
      expect(mockSendEmail).toHaveBeenCalled();
    });
  });

  describe('New subscriptions', () => {
    it('should create new subscription and send confirmation email', async () => {
      const request = createMockRequest({
        email: 'new@example.com',
        subdomain: 'test',
      });

      const newSubscription = createMockSubscription({
        id: 'new-sub-id',
        email: 'new@example.com',
      });

      const mockPayload = {
        find: jest.fn().mockResolvedValue({
          docs: [],
        }),
        create: jest.fn().mockResolvedValue(newSubscription),
      };

      mockGetPayload.mockResolvedValue(mockPayload as any);
      mockFetchTenant.mockResolvedValue(createMockTenant() as any);

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(mockPayload.create).toHaveBeenCalledWith({
        collection: 'newsletterSubscriptions',
        data: {
          email: 'new@example.com',
          tenant: 'tenant-id',
          status: 'pending',
        },
      });
      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'new@example.com',
        })
      );
    });
  });

  describe('Error handling', () => {
    it('should return 500 on unexpected error', async () => {
      const request = createMockRequest({});
      request.json = jest.fn().mockRejectedValue(new Error('Unexpected error'));

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed to process subscription');
    });
  });
});

