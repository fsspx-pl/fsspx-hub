import { timingSafeEqual } from 'crypto'
import { NextRequest } from 'next/server'

/**
 * Constant-time string comparison to prevent timing attacks
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns true if strings are equal, false otherwise
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  try {
    const aBuffer = Buffer.from(a, 'utf8')
    const bBuffer = Buffer.from(b, 'utf8')
    return timingSafeEqual(aBuffer, bBuffer)
  } catch {
    return false
  }
}

/**
 * Verifies the API token from the Authorization header
 * Uses constant-time comparison to prevent timing attacks
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

  const token = authHeader.replace(/^Bearer\s+/i, '').trim()

  if (!token) {
    return false
  }

  // Use constant-time comparison to prevent timing attacks
  const isValid = constantTimeCompare(token, apiToken)

  if (!isValid) {
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    console.warn(`[API Auth] Failed authentication attempt from IP: ${clientIp}`)
  }

  return isValid
}
