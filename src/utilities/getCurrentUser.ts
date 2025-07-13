import { getPayload } from 'payload'
import { cookies, headers } from 'next/headers'
import config from '@/payload.config'
import { User } from '@/payload-types'
import { isSuperOrTenantAdmin } from '@/collections/Users/utilities/isSuperOrTenantAdmin'

export async function getCurrentUser(): Promise<User | null> {
const cookieStore = await cookies()
const token = cookieStore.get('payload-token')?.value
  try {
    if (!token) {
      return null
    }

    const base64Payload = token.split('.')[1]
    const decodedPayload = JSON.parse(Buffer.from(base64Payload, 'base64').toString())
    
    if (!decodedPayload.id || decodedPayload.exp <= Date.now() / 1000) {
      return null
    }

    const payload = await getPayload({ config })
    const user = await payload.findByID({
      collection: 'users',
      id: decodedPayload.id,
    })

    return user || null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function canAccessPrintVersion(): Promise<boolean> {
  try {
    const user = await getCurrentUser()
    if (!user) return false

    const headersList = await headers()
    const payload = await getPayload({ config })

    // Create a minimal PayloadRequest-like object for the access control function
    const req = {
      headers: new Headers(Object.fromEntries(headersList.entries())),
      payload,
      user,
    } as any

    return await isSuperOrTenantAdmin({ req })
  } catch (error) {
    console.error('Error checking print access:', error)
    return false
  }
} 