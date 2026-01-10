import { headers } from 'next/headers';
import { getPayload, JWTAuthentication } from 'payload';
import configPromise from '@payload-config';
import { isSuperOrTenantAdmin } from '@/collections/Users/utilities/isSuperOrTenantAdmin';
import { PayloadRequest } from 'payload';

/**
 * Checks if the current user is authenticated and authorized to access print pages.
 * Uses PayloadCMS's built-in JWTAuthentication to verify tokens directly via local API.
 * Returns true if user is a super admin or tenant admin for the given domain.
 * @param domain - The tenant domain
 * @param token - Optional authentication token (from query parameter)
 */
export async function checkPrintAccess(domain: string, token?: string): Promise<boolean> {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get('cookie');
    const hostHeader = headersList.get('host');
    
    if (!cookieHeader && !token) {
      return false;
    }

    const payload = await getPayload({
      config: configPromise,
    });

    // Create a Headers object that JWTAuthentication expects
    // If a token is provided as a parameter, inject it into the cookie header
    let effectiveCookieHeader = cookieHeader || '';
    if (token) {
      const tokenCookieName = `${payload.config.cookiePrefix || 'payload'}-token`;
      effectiveCookieHeader = effectiveCookieHeader 
        ? `${effectiveCookieHeader}; ${tokenCookieName}=${token}`
        : `${tokenCookieName}=${token}`;
    }

    const authHeaders = new Headers();
    authHeaders.set('cookie', effectiveCookieHeader);
    if (hostHeader) {
      authHeaders.set('host', hostHeader);
    }

    // Use PayloadCMS's built-in JWT authentication via local API
    const { user } = await JWTAuthentication({
      headers: authHeaders,
      payload,
    });

    if (!user) {
      return false;
    }

    // Create a PayloadRequest-like object for isSuperOrTenantAdmin
    const req = {
      headers: {
        get: (name: string) => {
          if (name === 'cookie') return cookieHeader;
          if (name === 'host') return hostHeader || domain;
          return null;
        },
      },
      payload,
      user,
    } as unknown as PayloadRequest;

    // Check if user is super admin or tenant admin
    const isAuthorized = await isSuperOrTenantAdmin({ req });

    return isAuthorized;
  } catch (error) {
    // If any error occurs, deny access
    console.error('Error checking print access:', error);
    return false;
  }
}
