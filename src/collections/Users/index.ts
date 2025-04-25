
import { CollectionConfig } from 'payload'
import { anyone } from '../../access/anyone'
import { superAdminFieldAccess } from '../../access/superAdmins'
import { adminsAndSelf } from '../../access/adminsAndSelf'
import { tenantAdmins } from '../../access/tenantAdmins'
import { loginAfterCreate } from './hooks/loginAfterCreate'
import { recordLastLoggedInTenant } from './hooks/recordLastLoggedInTenant'
import { isSuperOrTenantAdmin } from './utilities/isSuperOrTenantAdmin'
import { revalidatePagesByAuthor } from './hooks/revalidateTenantPagesByAuthor'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  access: {
    read: adminsAndSelf,
    create: anyone,
    update: adminsAndSelf,
    delete: adminsAndSelf,
    admin: isSuperOrTenantAdmin,
  },
  hooks: {
    afterChange: [loginAfterCreate, revalidatePagesByAuthor],
    afterLogin: [recordLastLoggedInTenant],
  },
  fields: [
    {
      name: 'salutation',
      label: {
        en: 'Salutation',
        pl: 'Tytuł',
      },
      type: 'select',
      options: [
        {
          label: {
            en: 'Mr',
            pl: 'Pan',
          },
          value: 'mr',
        },
        {
          label: {
            en: 'Ms',
            pl: 'Pani',
          },
          value: 'ms',
        },
        {
          label: {
            en: 'Fr',
            pl: 'Ks.',
          },
          value: 'father',
        },
      ],
    },
    {
      name: 'firstName',
      type: 'text',
    },
    {
      name: 'lastName',
      type: 'text',
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      access: {
        create: superAdminFieldAccess,
        update: superAdminFieldAccess,
        read: superAdminFieldAccess,
      },
      options: [
        {
          label: 'Super Admin',
          value: 'super-admin',
        },
        {
          label: 'User',
          value: 'user',
        },
      ],
    },
    {
      name: 'tenants',
      type: 'array',
      label: 'Tenants',
      access: {
        create: tenantAdmins,
        update: tenantAdmins,
        read: tenantAdmins,
      },
      fields: [
        {
          name: 'tenant',
          type: 'relationship',
          relationTo: 'tenants',
          required: true,
        },
        {
          name: 'roles',
          type: 'select',
          hasMany: true,
          required: true,
          options: [
            {
              label: 'Admin',
              value: 'admin',
            },
            {
              label: 'User',
              value: 'user',
            },
          ],
        },
      ],
    },
    {
      name: 'lastLoggedInTenant',
      type: 'relationship',
      relationTo: 'tenants',
      index: true,
      access: {
        create: () => false,
        read: tenantAdmins,
        update: superAdminFieldAccess,
      },
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
