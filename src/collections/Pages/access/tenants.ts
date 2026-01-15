
import { Access } from 'payload'
import { isSuperAdmin } from '../../../utilities/isSuperAdmin'
import { Tenant } from '@/payload-types'

function toIdString(value: unknown): string | undefined {
  if (!value) return undefined
  return String(value)
}

export const tenants: Access = ({ req: { user }, data }) =>
  (user && isSuperAdmin(user)) ||
  // individual documents
  (data?.tenant?.id &&
    toIdString((user?.lastLoggedInTenant as Tenant)?.id) === toIdString(data.tenant.id)) || {
    // list of documents
    tenant: {
      equals: toIdString((user?.lastLoggedInTenant as Tenant)?.id),
    },
  }
