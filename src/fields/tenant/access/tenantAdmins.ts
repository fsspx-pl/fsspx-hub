
import { FieldAccess } from 'payload'
import { checkUserRoles } from '../../../utilities/checkUserRoles'
import { Tenant } from '@/payload-types'

export const tenantAdminFieldAccess: FieldAccess = ({ req: { user }, doc }) => {
  return (
    checkUserRoles(['super-admin'], user) ||
    !doc?.tenant ||
    (doc?.tenant &&
      user?.tenants?.some(
        ({ tenant: userTenant, roles }) =>
          (typeof doc?.tenant === 'string' ? doc?.tenant : doc?.tenant.id) === (userTenant as Tenant)?.id &&
          roles?.includes('admin'),
      ))
  )
}
