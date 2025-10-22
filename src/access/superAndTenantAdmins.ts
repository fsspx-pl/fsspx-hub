
import { checkTenantRoles } from '@/collections/Users/utilities/checkTenantRoles'
import { Tenant, User } from '@/payload-types'
import { isSuperAdmin } from '@/utilities/isSuperAdmin'
import { FieldAccess } from 'payload'

export const superAndTenantAdmins: FieldAccess = args => {
  const {
    req: { user },
    doc,
  } = args

  const isAdminOfTenant = (tenant: Tenant) => {
    const id = typeof tenant === 'string' ? tenant : tenant?.id
    return checkTenantRoles(['admin'], user, id)
  }

  const checkTenantAccess = () => {
    if (!doc) return false
    if (doc.tenant) return isAdminOfTenant(doc.tenant)
    return false
  }

  return (
    isSuperAdmin(user as User) ||
    checkTenantAccess()
  )
}
