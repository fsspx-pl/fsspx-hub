import { superAndTenantAdmins } from '@/access/superAndTenantAdmins'
import { Field } from 'payload'

export const user: Field = {
  name: 'user',
  label: {
    en: 'Author',
    pl: 'Autor',
  },
  type: 'relationship',
  relationTo: 'users',
  index: true,
  admin: {
    position: 'sidebar',
  },
  access: {
    create: superAndTenantAdmins,
    read: superAndTenantAdmins,
    update: superAndTenantAdmins,
  },
}
