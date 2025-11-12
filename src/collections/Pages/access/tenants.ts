
import { Access } from 'payload'
import { isSuperAdmin } from '../../../utilities/isSuperAdmin'
import { Tenant } from '@/payload-types'

export const tenants: Access = ({ req: { user }, data }) =>
  // individual documents
  (data?.tenant?.id && (user?.lastLoggedInTenant as Tenant)?.id === data.tenant.id) ||
  (!(user?.lastLoggedInTenant as Tenant)?.id && user && isSuperAdmin(user)) || {
    // list of documents
    tenant: {
      equals: (user?.lastLoggedInTenant as Tenant)?.id,
    },
  }
