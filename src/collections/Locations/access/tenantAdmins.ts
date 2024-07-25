
import { FieldAccess } from 'payload'
import { Tenant } from '@/payload-types'
import { checkTenantRoles } from '@/collections/Users/utilities/checkTenantRoles'
import { checkUserRoles } from '@/utilities/checkUserRoles'

export const tenantAdmins: FieldAccess = args => {
  const {
    req: { user },
    doc,
  } = args

  return (
    checkUserRoles(['super-admin'], user) ||
    doc?.tenants?.some(({ tenant }: { tenant: Tenant }) => {
      const id = typeof tenant === 'string' ? tenant : tenant?.id
      return checkTenantRoles(['admin'], user, id)
    })
  )
}
