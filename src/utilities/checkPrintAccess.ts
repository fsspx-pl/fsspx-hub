import { headers } from 'next/headers';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { isSuperOrTenantAdmin } from '@/collections/Users/utilities/isSuperOrTenantAdmin';
import { PayloadRequest } from 'payload';

/**
 * Checks if the current user is authenticated and authorized to access print pages.
 * Returns true if user is a super admin or tenant admin for the given domain.
 * @param domain - The tenant domain
 * @param token - Optional authentication token (from query parameter or header)
 */
export async function checkPrintAccess(domain: string, token?: string): Promise<boolean> {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get('cookie');
    const hostHeader = headersList.get('host');
    
    if (!cookieHeader) {
      return false;
    }

    const payload = await getPayload({
      config: configPromise,
    });

    // Use token from parameter if provided, otherwise try to extract from cookies
    let authToken: string | null = token || null;

    if (!authToken && cookieHeader) {
      // Try different possible cookie names for PayloadCMS authentication
      const possibleTokenCookies = [
        'payload-token',
        'payload-token-preview',
        'token',
        'accessToken',
      ];
      
      for (const cookieName of possibleTokenCookies) {
        const regex = new RegExp(`${cookieName}=([^;]+)`);
        const tokenMatch = cookieHeader.match(regex);
        if (tokenMatch) {
          authToken = tokenMatch[1];
          break;
        }
      }
    }

    if (!authToken) {
      return false;
    }

    // Create a PayloadRequest-like object with token for authentication
    // PayloadCMS expects the token in a cookie, so we'll add it to the cookie header
    const cookieHeaderWithToken = authToken 
      ? `${cookieHeader || ''}; payload-token=${authToken}`.replace(/^; /, '')
      : cookieHeader || '';

    const req = {
      headers: {
        get: (name: string) => {
          if (name === 'cookie') return cookieHeaderWithToken;
          if (name === 'host') return hostHeader || domain;
          return null;
        },
      },
      payload,
      user: null,
    } as unknown as PayloadRequest;

    // Use PayloadCMS local API to authenticate user from token
    // Make an internal HTTP request to PayloadCMS's /api/users/me endpoint
    // This will properly authenticate using cookies since it goes through PayloadCMS's HTTP handlers
    try {
      const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || `http://${hostHeader || domain}`;
      const meUrl = `${baseUrl}/api/users/me`;

      const meResponse = await fetch(meUrl, {
        method: 'GET',
        headers: {
          'Cookie': cookieHeaderWithToken,
          'Host': hostHeader || domain,
        },
      });

      if (meResponse.ok) {
        const meData = await meResponse.json();
        if (meData?.user) {
          // Fetch the full user object from PayloadCMS
          const user = await payload.findByID({
            collection: 'users',
            id: meData.user.id,
            depth: 2,
          });
          req.user = user as any;
        }
      }
    } catch (fetchError) {
      // Silently fail - authentication will be denied below
    }

    // After the operation, PayloadCMS should have set req.user if authenticated
    if (!req.user) {
      return false;
    }

    // Check if user is super admin or tenant admin
    const isAuthorized = await isSuperOrTenantAdmin({ req });

    return isAuthorized;
  } catch (error) {
    // If any error occurs, deny access
    console.error('Error checking print access:', error);
    return false;
  }
}

