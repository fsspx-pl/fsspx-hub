jest.mock('@payload-config', () => ({}), { virtual: true });
jest.mock('payload', () => ({
  getPayload: jest.fn(),
}));
jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));
jest.mock('@/collections/Users/utilities/isSuperOrTenantAdmin', () => ({
  isSuperOrTenantAdmin: jest.fn(),
}));

import { checkPrintAccess } from './checkPrintAccess';
import { getPayload } from 'payload';
import { headers } from 'next/headers';
import { isSuperOrTenantAdmin } from '@/collections/Users/utilities/isSuperOrTenantAdmin';
import { User, Tenant } from '@/payload-types';

const mockGetPayload = getPayload as jest.MockedFunction<typeof getPayload>;
const mockHeaders = headers as jest.MockedFunction<typeof headers>;
const mockIsSuperOrTenantAdmin = isSuperOrTenantAdmin as jest.MockedFunction<typeof isSuperOrTenantAdmin>;

// Mock global fetch
global.fetch = jest.fn();

function createMockPayload() {
  return {
    findByID: jest.fn(),
  };
}

function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-id',
    email: 'test@example.com',
    tenants: [],
    ...overrides,
  } as User;
}

function setupMockHeaders(cookie: string | null = null, host: string = 'test-domain') {
  mockHeaders.mockResolvedValue({
    get: jest.fn((name: string) => {
      if (name === 'cookie') return cookie;
      if (name === 'host') return host;
      return null;
    }),
  } as any);
}

function setupMockPayloadAndGetPayload() {
  const mockPayload = createMockPayload();
  mockGetPayload.mockResolvedValue(mockPayload as any);
  return mockPayload;
}

function setupSuccessfulAuth(
  mockPayload: ReturnType<typeof createMockPayload>,
  mockUser: User,
  isAuthorized: boolean = true
) {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue({ user: { id: mockUser.id } }),
  });
  mockPayload.findByID = jest.fn().mockResolvedValue(mockUser);
  mockIsSuperOrTenantAdmin.mockResolvedValue(isAuthorized);
}

function setupFailedAuth(status: number = 401) {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: false,
    status,
    statusText: 'Unauthorized',
  });
}

describe('checkPrintAccess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('should return false when no cookie header is present', async () => {
    setupMockHeaders(null);

    const result = await checkPrintAccess('test-domain');

    expect(result).toBe(false);
  });

  it('should return false when no token is found in cookies', async () => {
    setupMockHeaders('some-other-cookie=value');

    const result = await checkPrintAccess('test-domain');

    expect(result).toBe(false);
  });

  it('should extract token from payload-token cookie', async () => {
    const mockPayload = setupMockPayloadAndGetPayload();
    setupMockHeaders('payload-token=test-token-123');
    const mockUser = createMockUser();
    setupSuccessfulAuth(mockPayload, mockUser);

    const result = await checkPrintAccess('test-domain');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/users/me'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Cookie: expect.stringContaining('payload-token=test-token-123'),
        }),
      })
    );
    expect(mockPayload.findByID).toHaveBeenCalledWith({
      collection: 'users',
      id: mockUser.id,
      depth: 2,
    });
    expect(result).toBe(true);
  });

  it('should use token from parameter when provided', async () => {
    const mockPayload = setupMockPayloadAndGetPayload();
    setupMockHeaders('other-cookie=value');
    const mockUser = createMockUser();
    setupSuccessfulAuth(mockPayload, mockUser);

    const result = await checkPrintAccess('test-domain', 'provided-token');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/users/me'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Cookie: expect.stringContaining('payload-token=provided-token'),
        }),
      })
    );
    expect(result).toBe(true);
  });

  it('should return false when /api/users/me returns error', async () => {
    setupMockPayloadAndGetPayload();
    setupMockHeaders('payload-token=test-token');
    setupFailedAuth();

    const result = await checkPrintAccess('test-domain');

    expect(result).toBe(false);
  });

  it('should return false when /api/users/me does not return user', async () => {
    setupMockPayloadAndGetPayload();
    setupMockHeaders('payload-token=test-token');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });

    const result = await checkPrintAccess('test-domain');

    expect(result).toBe(false);
  });

  it('should return false when user is not authorized (not super admin or tenant admin)', async () => {
    const mockPayload = setupMockPayloadAndGetPayload();
    setupMockHeaders('payload-token=test-token');
    const mockUser = createMockUser();
    setupSuccessfulAuth(mockPayload, mockUser, false);

    const result = await checkPrintAccess('test-domain');

    expect(result).toBe(false);
  });

  it('should return true when user is authorized (super admin or tenant admin)', async () => {
    const mockPayload = setupMockPayloadAndGetPayload();
    setupMockHeaders('payload-token=test-token');
    const mockUser = createMockUser();
    setupSuccessfulAuth(mockPayload, mockUser);

    const result = await checkPrintAccess('test-domain');

    expect(result).toBe(true);
  });

  it('should handle fetch errors gracefully', async () => {
    setupMockPayloadAndGetPayload();
    setupMockHeaders('payload-token=test-token');
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const result = await checkPrintAccess('test-domain');

    expect(result).toBe(false);
  });

  it('should try different cookie names for token extraction', async () => {
    const mockPayload = setupMockPayloadAndGetPayload();
    setupMockHeaders('payload-token-preview=preview-token');
    const mockUser = createMockUser();
    setupSuccessfulAuth(mockPayload, mockUser);

    const result = await checkPrintAccess('test-domain');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Cookie: expect.stringContaining('payload-token=preview-token'),
        }),
      })
    );
    expect(result).toBe(true);
  });

  it('should use PAYLOAD_PUBLIC_SERVER_URL when available', async () => {
    const originalEnv = process.env.PAYLOAD_PUBLIC_SERVER_URL;
    process.env.PAYLOAD_PUBLIC_SERVER_URL = 'https://custom-server.com';

    const mockPayload = setupMockPayloadAndGetPayload();
    setupMockHeaders('payload-token=test-token');
    const mockUser = createMockUser();
    setupSuccessfulAuth(mockPayload, mockUser);

    await checkPrintAccess('test-domain');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://custom-server.com/api/users/me',
      expect.any(Object)
    );

    if (originalEnv) {
      process.env.PAYLOAD_PUBLIC_SERVER_URL = originalEnv;
    } else {
      delete process.env.PAYLOAD_PUBLIC_SERVER_URL;
    }
  });
});


