import { NextRequest, NextResponse } from "next/server";
import { getSubdomain } from "./utilities/getSubdomain";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /ingest (PostHog proxy routes)
     */
    "/((?!api/|_next/|admin|ingest/).*)"
  ]
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  const subdomain = getSubdomain(req)

  // #region agent log
  try {
    const fs = await import('fs/promises');
    await fs.appendFile('/Users/jacek/Projects/fsspx/hub/.cursor/debug.log', JSON.stringify({
      location: 'middleware.ts:19',
      message: 'Middleware called',
      data: {
        pathname: url.pathname,
        subdomain,
        host: req.headers.get('host'),
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'A'
    }) + '\n');
  } catch (e) {}
  // #endregion

  if (!subdomain) {
    return NextResponse.next();
  }

  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;

  const newPath = `/${subdomain}${path}`;
  const rewrittenURL = new URL(newPath, req.url);

  // #region agent log
  try {
    const fs = await import('fs/promises');
    await fs.appendFile('/Users/jacek/Projects/fsspx/hub/.cursor/debug.log', JSON.stringify({
      location: 'middleware.ts:45',
      message: 'Middleware rewrite',
      data: {
        originalPath: url.pathname,
        subdomain,
        newPath,
        rewrittenPath: rewrittenURL.pathname,
        host: req.headers.get('host'),
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'A'
    }) + '\n');
  } catch (e) {}
  // #endregion

  return NextResponse.rewrite(rewrittenURL);
}
