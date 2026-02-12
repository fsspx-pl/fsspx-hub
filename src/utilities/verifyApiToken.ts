import { NextRequest } from 'next/server'

/**
 * Verifies the API token from the Authorization header
 * @param request - The Next.js request object
 * @returns true if token is valid, false otherwise
 */
export function verifyApiToken(request: NextRequest): boolean {
  const apiToken = process.env.API_TOKEN

  if (!apiToken) {
    console.error('API_TOKEN environment variable is not set')
    return false
  }

  const authHeader = request.headers.get('authorization')

  if (!authHeader) {
    return false
  }

  const token = authHeader.replace(/^Bearer\s+/i, '')

  if (!token) {
    return false
  }

  return token === apiToken
}
