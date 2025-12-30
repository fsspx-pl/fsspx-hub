import { headers } from 'next/headers';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { isSuperOrTenantAdmin } from '@/collections/Users/utilities/isSuperOrTenantAdmin';
import { PayloadRequest } from 'payload';

/**
 * Checks if the current user is authenticated and authorized to view draft content.
 * Returns true if user is a super admin or tenant admin for the given domain.
 */
export async function checkPrintAccess(domain: string): Promise<boolean> {
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

    // Create a PayloadRequest-like object with cookies for authentication
    const req = {
      headers: {
        get: (name: string) => {
          if (name === 'cookie') return cookieHeader;
          if (name === 'host') return hostHeader || domain;
          return null;
        },
      },
      payload,
      user: null,
    } as unknown as PayloadRequest;

    // Use PayloadCMS local API to authenticate user from cookies
    // PayloadCMS will automatically extract and validate the token from cookies
    // when we pass the request object to operations
    try {
      // Extract token from cookies - PayloadCMS uses 'payload-token' cookie
      const tokenMatch = cookieHeader.match(/payload-token=([^;]+)/);
      if (!tokenMatch) {
        return false;
      }

      // Use PayloadCMS to find the user by making a request with the token
      // PayloadCMS will automatically authenticate when we pass cookies in the request
      // We'll use a dummy operation to trigger authentication
      await payload.find({
        collection: 'users',
        where: {
          id: {
            exists: false, // This will never match, but triggers auth
          },
        },
        limit: 0,
        req,
      });

      // After the operation, PayloadCMS should have set req.user if authenticated
      if (!req.user) {
        return false;
      }

      // Check if user is super admin or tenant admin
      return await isSuperOrTenantAdmin({ req });
    } catch (authError) {
      // If authentication fails, deny access
      return false;
    }
  } catch (error) {
    // If any error occurs, deny access
    console.error('Error checking print access:', error);
    return false;
  }
}

