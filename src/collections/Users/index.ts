
import { CollectionConfig } from 'payload'
import { adminsAndSelf } from '../../access/adminsAndSelf'
import { superAdmins } from '../../access/superAdmins'
import { superAndTenantAdmins } from '../../access/superAndTenantAdmins'
import { loginAfterCreate } from './hooks/loginAfterCreate'
import { recordLastLoggedInTenant } from './hooks/recordLastLoggedInTenant'
import { revalidateAnnouncementsByAuthor } from './hooks/revalidateTenantPagesByAuthor'
import { isSuperOrTenantAdmin } from './utilities/isSuperOrTenantAdmin'

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
    defaultColumns: ['firstName', 'lastName', 'email', 'roles', 'tenants'],
  },
  access: {
    read: adminsAndSelf,
    create: isSuperOrTenantAdmin,
    update: adminsAndSelf,
    delete: adminsAndSelf,
    admin: isSuperOrTenantAdmin,
  },
  hooks: {
    afterChange: [loginAfterCreate, revalidateAnnouncementsByAuthor],
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
        create: superAdmins,
        update: superAdmins,
        read: superAdmins,
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
        // create: superAndTenantAdmins,
        // update: superAndTenantAdmins,
        // read: superAndTenantAdmins,
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
                en: 'Tenant Admin',
                pl: 'Administrator Lokalizacji',
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
        read: superAndTenantAdmins,
        update: superAdmins,
      },
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
