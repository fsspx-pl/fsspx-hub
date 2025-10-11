import { NextRequest, NextResponse } from "next/server";
import { getSubdomain } from "./utilities/getSubdomain";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     */
    "/((?!api/|_next/|admin|favicon.ico|apple-icon.png|icon.svg|.*\\.).*)"
  ]
};

// Cache for subdomain validation to avoid repeated database calls
const subdomainCache = new Map<string, { valid: boolean; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const startTime = Date.now();

  // Early return for static assets
  if (url.pathname.includes('.')) {
    return NextResponse.next();
  }

  const subdomain = getSubdomain(req);

  if (!subdomain) {
    return NextResponse.next();
  }

  const cacheKey = subdomain;
  const cached = subdomainCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    if (!cached.valid) {
      return new NextResponse('Tenant not found', { status: 404 });
    }
    
    const response = NextResponse.rewrite(
      new URL(`/${subdomain}${url.pathname}${url.search}`, req.url)
    );
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
    response.headers.set('X-Tenant', subdomain);
    
    return response;
  }

  // For unknown subdomains, we could add database validation here
  // For now, we'll assume they're valid and cache them
  subdomainCache.set(cacheKey, { valid: true, timestamp: Date.now() });

  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;

  const newPath = `/${subdomain}${path}`;
  const rewrittenURL = new URL(newPath, req.url);

  const response = NextResponse.rewrite(rewrittenURL);
  
  // Add performance headers
  response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
  response.headers.set('X-Tenant', subdomain);
  response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);

  return response;
}
