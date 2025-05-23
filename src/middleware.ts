import { NextRequest, NextResponse } from "next/server";
import { getSubdomain } from "./utilities/getSubdomain";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     */
    "/((?!api/|_next/|admin).*)"
  ]
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  const subdomain = getSubdomain(req)

  if (!subdomain) {
    return NextResponse.next();
  }

  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;

  const newPath = `/${subdomain}${path}`;
  const rewrittenURL = new URL(newPath, req.url);

  return NextResponse.rewrite(rewrittenURL);
}
