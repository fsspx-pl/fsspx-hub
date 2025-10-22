
import { anyone } from '@/access/anyone'
import { superAndTenantAdmins } from '@/access/superAndTenantAdmins'
import { Tenant } from '@/payload-types'
import { isSuperAdmin } from '@/utilities/isSuperAdmin'
import { Field } from 'payload'

export const tenant: Field = {
  name: 'tenant',
  label: {
    en: 'Tenant',
    pl: 'Lokalizacja',
  },
  type: 'relationship',
  relationTo: 'tenants',
  // don't require this field because we need to auto-populate it, see below
  // required: true,
  // we also don't want to hide this field because super-admins may need to manage it
  // to achieve this, create a custom component that conditionally renders the field based on the user's role
  // hidden: true,
  index: true,
  admin: {
    position: 'sidebar',
  },
  access: {
    create: superAndTenantAdmins,
    read: anyone,
    update: superAndTenantAdmins,
  },
  hooks: {
    // automatically set the tenant to the last logged in tenant
    // for super admins, allow them to set the tenant
    beforeChange: [
      async ({ req: { user }, data }) => {
        if(!user) {
          return undefined
        }
        if (isSuperAdmin(user) && data?.tenant) {
          return data.tenant
        }
        if ((user?.lastLoggedInTenant as Tenant)?.id) {
          return (user?.lastLoggedInTenant as Tenant)?.id
        }
      },
    ],
  },
}
