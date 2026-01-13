jest.mock('@payload-config', () => ({}), { virtual: true });
jest.mock('payload', () => ({
  getPayload: jest.fn(),
  JWTAuthentication: jest.fn(),
}));
jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));
jest.mock('@/collections/Users/utilities/isSuperOrTenantAdmin', () => ({
  isSuperOrTenantAdmin: jest.fn(),
}));

import { checkPrintAccess } from './checkPrintAccess';
import { getPayload, JWTAuthentication } from 'payload';
import { headers } from 'next/headers';
import { isSuperOrTenantAdmin } from '@/collections/Users/utilities/isSuperOrTenantAdmin';
import { User } from '@/payload-types';

const mockGetPayload = getPayload as jest.MockedFunction<typeof getPayload>;
const mockHeaders = headers as jest.MockedFunction<typeof headers>;
const mockIsSuperOrTenantAdmin = isSuperOrTenantAdmin as jest.MockedFunction<typeof isSuperOrTenantAdmin>;
const mockJWTAuthentication = JWTAuthentication as jest.MockedFunction<typeof JWTAuthentication>;

function createMockPayload() {
  return {
    config: {
      cookiePrefix: 'payload',
    },
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

function setupSuccessfulAuth(mockUser: User, isAuthorized: boolean = true) {
  mockJWTAuthentication.mockResolvedValue({ user: mockUser as any });
  mockIsSuperOrTenantAdmin.mockResolvedValue(isAuthorized);
}

function setupFailedAuth() {
  mockJWTAuthentication.mockResolvedValue({ user: null });
}

describe('checkPrintAccess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return false when no cookie header and no token is present', async () => {
    setupMockHeaders(null);
    setupMockPayloadAndGetPayload();

    const result = await checkPrintAccess('test-domain');

    expect(result).toBe(false);
  });

  it('should use JWTAuthentication to verify token from cookies', async () => {
    setupMockPayloadAndGetPayload();
    setupMockHeaders('payload-token=test-token-123');
    const mockUser = createMockUser();
    setupSuccessfulAuth(mockUser);

    const result = await checkPrintAccess('test-domain');

    expect(mockJWTAuthentication).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.any(Headers),
        payload: expect.any(Object),
      })
    );
    // Token is passed via Authorization header
    const callArgs = mockJWTAuthentication.mock.calls[0][0];
    const authHeader = callArgs.headers.get('Authorization');
    expect(authHeader).toBe('JWT test-token-123');
    expect(result).toBe(true);
  });

  it('should use token from parameter when provided', async () => {
    setupMockPayloadAndGetPayload();
    setupMockHeaders('other-cookie=value');
    const mockUser = createMockUser();
    setupSuccessfulAuth(mockUser);

    const result = await checkPrintAccess('test-domain', 'provided-token');

    // Verify JWTAuthentication was called with Authorization header
    expect(mockJWTAuthentication).toHaveBeenCalled();
    const callArgs = mockJWTAuthentication.mock.calls[0][0];
    const authHeader = callArgs.headers.get('Authorization');
    expect(authHeader).toBe('JWT provided-token');
    expect(result).toBe(true);
  });

  it('should return false when JWTAuthentication returns no user', async () => {
    setupMockPayloadAndGetPayload();
    setupMockHeaders('payload-token=test-token');
    setupFailedAuth();

    const result = await checkPrintAccess('test-domain');

    expect(result).toBe(false);
  });

  it('should return false when user is not authorized (not super admin or tenant admin)', async () => {
    setupMockPayloadAndGetPayload();
    setupMockHeaders('payload-token=test-token');
    const mockUser = createMockUser();
    setupSuccessfulAuth(mockUser, false);

    const result = await checkPrintAccess('test-domain');

    expect(result).toBe(false);
  });

  it('should return true when user is authorized (super admin or tenant admin)', async () => {
    setupMockPayloadAndGetPayload();
    setupMockHeaders('payload-token=test-token');
    const mockUser = createMockUser();
    setupSuccessfulAuth(mockUser);

    const result = await checkPrintAccess('test-domain');

    expect(result).toBe(true);
  });

  it('should handle JWTAuthentication errors gracefully', async () => {
    setupMockPayloadAndGetPayload();
    setupMockHeaders('payload-token=test-token');
    mockJWTAuthentication.mockRejectedValue(new Error('Auth error'));

    const result = await checkPrintAccess('test-domain');

    expect(result).toBe(false);
  });

  it('should pass host header to the auth headers', async () => {
    setupMockPayloadAndGetPayload();
    setupMockHeaders('payload-token=test-token', 'custom-host.example.com');
    const mockUser = createMockUser();
    setupSuccessfulAuth(mockUser);

    await checkPrintAccess('test-domain');

    const callArgs = mockJWTAuthentication.mock.calls[0][0];
    const hostHeader = callArgs.headers.get('host');
    expect(hostHeader).toBe('custom-host.example.com');
  });

  it('should work when only token parameter is provided (no cookies)', async () => {
    setupMockPayloadAndGetPayload();
    setupMockHeaders(null); // No cookies
    const mockUser = createMockUser();
    mockJWTAuthentication.mockResolvedValue({ user: mockUser as any });
    mockIsSuperOrTenantAdmin.mockResolvedValue(true);

    const result = await checkPrintAccess('test-domain', 'standalone-token');

    expect(mockJWTAuthentication).toHaveBeenCalled();
    const callArgs = mockJWTAuthentication.mock.calls[0][0];
    // Token is passed via Authorization header, not cookies
    const authHeader = callArgs.headers.get('Authorization');
    expect(authHeader).toBe('JWT standalone-token');
    expect(result).toBe(true);
  });
});
