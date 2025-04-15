import { NextRequest } from "next/server";

export const getSubdomain = (req: Partial<NextRequest>) => {
  const host = req.headers?.get('host')
  const domain = host?.split('.')[0]
  if (!domain) {
    console.error('No domain found in request')
    return null
  }
  return domain
}