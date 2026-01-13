import { headers } from 'next/headers';
import { getPayload, JWTAuthentication } from 'payload';
import configPromise from '@payload-config';
import { isSuperOrTenantAdmin } from '@/collections/Users/utilities/isSuperOrTenantAdmin';
import { PayloadRequest } from 'payload';

const DEBUG = process.env.DEBUG === 'true' || process.env.DEBUG_PRINT_ACCESS === 'true';

/**
 * Debug logging helper - only logs when DEBUG env var is enabled
 * Uses PayloadCMS logger when available, falls back to console.log
 */
function debugLog(payload: any, message: string, data?: Record<string, unknown>): void {
  if (!DEBUG) return;
  
  const logMessage = data 
    ? `[checkPrintAccess] ${message} ${JSON.stringify(data)}`
    : `[checkPrintAccess] ${message}`;
  
  if (payload?.logger) {
    payload.logger.info(logMessage);
  } else {
    console.log(logMessage);
  }
}

/**
 * Extracts the JWT token from cookies.
 * PayloadCMS uses the pattern: {cookiePrefix}-token
 */
function extractTokenFromCookies(cookieHeader: string, cookiePrefix: string): string | null {
  const tokenCookieName = `${cookiePrefix}-token`;
  const regex = new RegExp(`${tokenCookieName}=([^;]+)`);
  const match = cookieHeader.match(regex);
  return match ? match[1] : null;
}

/**
 * Checks if the current user is authenticated and authorized to access print pages.
 * Uses PayloadCMS's built-in JWTAuthentication to verify tokens directly via local API.
 * Returns true if user is a super admin or tenant admin for the given domain.
 * @param domain - The tenant domain
 * @param token - Optional authentication token (from query parameter)
 */
export async function checkPrintAccess(domain: string, token?: string): Promise<boolean> {
  let payload: any = null;
  
  try {
    payload = await getPayload({
      config: configPromise,
    });
    
    debugLog(payload, 'Starting checkPrintAccess', { domain, hasTokenParam: !!token });
    
    const headersList = await headers();
    const cookieHeader = headersList.get('cookie');
    const hostHeader = headersList.get('host');
    
    debugLog(payload, 'Headers extracted', { 
      hasCookieHeader: !!cookieHeader, 
      host: hostHeader,
      cookieLength: cookieHeader?.length || 0 
    });
    
    if (!cookieHeader && !token) {
      debugLog(payload, 'No cookies or token provided - denying access');
      return false;
    }

    const cookiePrefix = payload.config.cookiePrefix || 'payload';
    debugLog(payload, 'Payload config loaded', { cookiePrefix });
    
    // Extract token from cookie if not provided as parameter
    let authToken: string | undefined = token;
    if (!authToken && cookieHeader) {
      authToken = extractTokenFromCookies(cookieHeader, cookiePrefix) ?? undefined;
      debugLog(payload, 'Token extracted from cookies', { 
        found: !!authToken,
        cookiePrefix,
        tokenLength: authToken?.length || 0 
      });
    } else if (authToken) {
      debugLog(payload, 'Using token from parameter', { tokenLength: authToken.length });
    }
    
    if (!authToken) {
      debugLog(payload, 'No auth token found in cookies or params - denying access');
      return false;
    }

    // Create a Headers object for JWTAuthentication
    // Use Authorization header with JWT prefix to bypass CSRF check
    // This is the recommended way for server-side auth where Origin header may not match
    const authHeaders = new Headers();
    authHeaders.set('Authorization', `JWT ${authToken}`);
    if (hostHeader) {
      authHeaders.set('host', hostHeader);
    }

    debugLog(payload, 'Calling JWTAuthentication', { 
      hasAuthHeader: authHeaders.has('Authorization'),
      hasHostHeader: authHeaders.has('host')
    });

    // Use PayloadCMS's built-in JWT authentication via local API
    const { user } = await JWTAuthentication({
      headers: authHeaders,
      payload,
    });

    if (!user) {
      debugLog(payload, 'JWTAuthentication returned no user - denying access');
      return false;
    }

    debugLog(payload, 'User authenticated successfully', { 
      userId: user.id, 
      email: user.email,
      collection: (user as any).collection 
    });

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

    debugLog(payload, 'Checking authorization (super admin or tenant admin)');
    
    // Check if user is super admin or tenant admin
    const isAuthorized = await isSuperOrTenantAdmin({ req });

    debugLog(payload, 'Authorization check completed', { 
      isAuthorized,
      domain,
      userId: user.id 
    });
    
    return isAuthorized;
  } catch (error) {
    // Always log errors, even when DEBUG is off
    if (payload?.logger) {
      payload.logger.error('[checkPrintAccess] Error:', error);
    } else {
      console.error('[checkPrintAccess] Error:', error);
    }
    
    if (DEBUG && error instanceof Error && payload) {
      debugLog(payload, 'Error details', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    return false;
  }
}
