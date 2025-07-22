
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
  labels: {
    singular: {
      pl: 'Użytkownik',
      en: 'User',
    },
    plural: {
      pl: 'Użytkownicy',
      en: 'Users',
    },
  },
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
      label: {
        en: 'First Name',
        pl: 'Imię',
      },
      type: 'text',
    },
    {
      name: 'lastName',
      label: {
        en: 'Last Name',
        pl: 'Nazwisko',
      },
      type: 'text',
    },
    {
      name: 'avatar',
      label: {
        en: 'Avatar',
        pl: 'Awatar',
      },
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'roles',
      label: {
        en: 'Roles',
        pl: 'Role',
      },
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
          label: {
            en: 'Super Admin',
            pl: 'Super Administrator',
          },
          value: 'super-admin',
        },
        {
          label: {
            en: 'User',
            pl: 'Użytkownik',
          },
          value: 'user',
        },
      ],
    },
    {
      name: 'tenants',
      type: 'array',
      label: {
        en: 'Tenants',
        pl: 'Lokalizacje',
      },
      access: {
        create: tenantAdmins,
        update: tenantAdmins,
        read: tenantAdmins,
      },
      fields: [
        {
          name: 'tenant',
          label: {
            en: 'Tenant',
            pl: 'Lokalizacja',
          },
          type: 'relationship',
          relationTo: 'tenants',
          required: true,
        },
        {
          name: 'roles',
          label: {
            en: 'Roles',
            pl: 'Role',
          },
          type: 'select',
          hasMany: true,
          required: true,
          options: [
            {
              label: {
                en: 'Admin',
                pl: 'Administrator',
              },
              value: 'admin',
            },
            {
              label: {
                en: 'User',
                pl: 'Użytkownik',
              },
              value: 'user',
            },
          ],
        },
      ],
    },
    {
      name: 'lastLoggedInTenant',
      label: {
        en: 'Last Logged In Tenant',
        pl: 'Ostatnio zalogowany w lokalizacji',
      },
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
