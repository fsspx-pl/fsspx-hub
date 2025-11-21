jest.mock('@payload-config', () => ({}), { virtual: true });
jest.mock('payload', () => ({
  getPayload: jest.fn(),
}));
jest.mock('@/_api/fetchTenants');
jest.mock('@/utilities/awsSes', () => ({
  unsubscribeFromTopic: jest.fn(),
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
import { unsubscribeFromTopic } from '@/utilities/awsSes';

const mockGetPayload = getPayload as jest.MockedFunction<typeof getPayload>;
const mockUnsubscribeFromTopic = unsubscribeFromTopic as jest.MockedFunction<typeof unsubscribeFromTopic>;

// Helper function to create a mock request with JSON body
function createMockRequest(body: any, url = 'http://localhost:3000/api/newsletter/unsubscribe'): NextRequest {
  const request = new NextRequest(url);
  const mockJson = jest.fn().mockResolvedValue(body);
  request.json = mockJson;
  return request;
}

// Helper function to create a mock subscription
function createMockSubscription(overrides: Partial<any> = {}) {
  return {
    id: 'sub-id',
    email: 'test@example.com',
    status: 'confirmed',
    tenant: { id: 'tenant-id' },
    ...overrides,
  };
}

// Helper function to create a mock tenant
function createMockTenant(overrides: Partial<any> = {}) {
  return {
    id: 'tenant-id',
    domain: 'test',
    mailingGroupId: 'test-group',
    topicName: 'test-topic',
    ...overrides,
  };
}

describe('POST /api/newsletter/unsubscribe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUnsubscribeFromTopic.mockResolvedValue({
      email: 'test@example.com',
      topicName: 'test-topic',
      success: true,
    } as any);
  });

  describe('Validation', () => {
    it('should return 400 if subscriptionId is missing', async () => {
      const request = createMockRequest({
        email: 'test@example.com',
        subdomain: 'test',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required fields');
    });

    it('should return 400 if email is missing', async () => {
      const request = createMockRequest({
        subscriptionId: 'sub-id',
        subdomain: 'test',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required fields');
    });

    it('should return 400 if subdomain is missing', async () => {
      const request = createMockRequest({
        subscriptionId: 'sub-id',
        email: 'test@example.com',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required fields');
    });

    it('should return 404 if subscription is not found', async () => {
      const request = createMockRequest({
        subscriptionId: 'nonexistent-id',
        email: 'test@example.com',
        subdomain: 'test',
      });

      const mockPayload = {
        findByID: jest.fn().mockRejectedValue(new Error('Not found')),
      };

      mockGetPayload.mockResolvedValue(mockPayload as any);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Subscription not found');
    });

    it('should return 400 if email does not match subscription', async () => {
      const request = createMockRequest({
        subscriptionId: 'sub-id',
        email: 'wrong@example.com',
        subdomain: 'test',
      });

      const subscription = createMockSubscription();
      const mockPayload = {
        findByID: jest
          .fn()
          .mockResolvedValueOnce(subscription)
          .mockResolvedValueOnce(createMockTenant()),
      };

      mockGetPayload.mockResolvedValue(mockPayload as any);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Subscription details do not match');
    });

    it('should return 400 if subdomain does not match subscription', async () => {
      const request = createMockRequest({
        subscriptionId: 'sub-id',
        email: 'test@example.com',
        subdomain: 'wrong',
      });

      const subscription = createMockSubscription();
      const mockPayload = {
        findByID: jest
          .fn()
          .mockResolvedValueOnce(subscription)
          .mockResolvedValueOnce(createMockTenant()),
      };

      mockGetPayload.mockResolvedValue(mockPayload as any);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Subscription details do not match');
    });
  });

  describe('Already unsubscribed', () => {
    it('should return success if already unsubscribed', async () => {
      const request = createMockRequest({
        subscriptionId: 'sub-id',
        email: 'test@example.com',
        subdomain: 'test',
      });

      const subscription = createMockSubscription({ status: 'unsubscribed' });
      const mockPayload = {
        findByID: jest
          .fn()
          .mockResolvedValueOnce(subscription)
          .mockResolvedValueOnce(createMockTenant()),
      };

      mockGetPayload.mockResolvedValue(mockPayload as any);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.alreadyUnsubscribed).toBe(true);
      expect(mockUnsubscribeFromTopic).not.toHaveBeenCalled();
    });
  });

  describe('Successful unsubscribe', () => {
    it('should unsubscribe and update status', async () => {
      const request = createMockRequest({
        subscriptionId: 'sub-id',
        email: 'test@example.com',
        subdomain: 'test',
      });

      const subscription = createMockSubscription();
      const tenant = createMockTenant();
      const mockPayload = {
        findByID: jest
          .fn()
          .mockResolvedValueOnce(subscription)
          .mockResolvedValueOnce(tenant),
        update: jest.fn().mockResolvedValue({}),
      };

      mockGetPayload.mockResolvedValue(mockPayload as any);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Successfully unsubscribed from newsletter');
      expect(mockUnsubscribeFromTopic).toHaveBeenCalledWith('test-group', 'test@example.com', 'test-topic');
      expect(mockPayload.update).toHaveBeenCalledWith({
        collection: 'newsletterSubscriptions',
        id: 'sub-id',
        data: {
          status: 'unsubscribed',
        },
      });
    });

    it('should handle AWS SES errors gracefully', async () => {
      const request = createMockRequest({
        subscriptionId: 'sub-id',
        email: 'test@example.com',
        subdomain: 'test',
      });

      const subscription = createMockSubscription();
      const tenant = createMockTenant();
      const mockPayload = {
        findByID: jest
          .fn()
          .mockResolvedValueOnce(subscription)
          .mockResolvedValueOnce(tenant),
        update: jest.fn().mockResolvedValue({}),
      };

      mockGetPayload.mockResolvedValue(mockPayload as any);
      mockUnsubscribeFromTopic.mockRejectedValue(new Error('AWS error'));

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.awsError).toBe(true);
      expect(mockPayload.update).toHaveBeenCalled(); // Should still update Payload
    });

    it('should return 400 if tenant has no newsletter settings', async () => {
      const request = createMockRequest({
        subscriptionId: 'sub-id',
        email: 'test@example.com',
        subdomain: 'test',
      });

      const subscription = createMockSubscription();
      const tenant = createMockTenant({ mailingGroupId: null, topicName: null });
      const mockPayload = {
        findByID: jest
          .fn()
          .mockResolvedValueOnce(subscription)
          .mockResolvedValueOnce(tenant),
      };

      mockGetPayload.mockResolvedValue(mockPayload as any);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Newsletter settings not configured for this tenant');
    });
  });

  describe('Error handling', () => {
    it('should return 500 on unexpected error', async () => {
      const request = createMockRequest({});
      request.json = jest.fn().mockRejectedValue(new Error('Unexpected error'));

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed to process unsubscribe request');
    });
  });
});

