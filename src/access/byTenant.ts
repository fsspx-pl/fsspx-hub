import { Access } from 'payload'
import { isSuperAdmin } from '@/utilities/isSuperAdmin'
import { Tenant, User } from '@/payload-types'

function getLastTenantId(user: User | null | undefined): string | undefined {
  const last = (user?.lastLoggedInTenant as Tenant | string | undefined)
  if (!last) return undefined
  // Be resilient to ObjectId-like values in legacy DBs
  const id = typeof last === 'string' ? last : (last as any)?.id
  if (!id) return undefined
  return String(id)
}

// Restrict access strictly to the user's last logged-in tenant (or allow super-admins fully)
export const tenantOnlyAccess: Access = ({ req: { user }, data }) => {
  if (!user) return false
  if (isSuperAdmin(user)) return true

  const lastTenantId = getLastTenantId(user)
  if (!lastTenantId) return false

  // Document-level guard
  if (data?.tenant) {
    const docTenant = typeof data.tenant === 'string' ? data.tenant : (data.tenant as any)?.id
    if (!docTenant) return false
    return String(docTenant) === String(lastTenantId)
  }

  // Collection-level guard
  return {
    tenant: {
      equals: String(lastTenantId),
    },
  }
}

// Allow public reads, but if a user is present in admin/API, scope to their tenant
export const tenantReadOrPublic: Access = ({ req: { user } }) => {
  if (!user) return true
  if (isSuperAdmin(user)) return true

  const lastTenantId = getLastTenantId(user)
  if (!lastTenantId) return false

  return {
    tenant: {
      equals: String(lastTenantId),
    },
  }
}


