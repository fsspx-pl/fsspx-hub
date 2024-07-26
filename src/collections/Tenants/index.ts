
import { CollectionConfig } from 'payload'
import { superAdmins } from '../../access/superAdmins'
import { anyone } from '@/access/anyone'
import { tenantAdmins } from '@/access/tenantAdmins'
import { location } from '@/fields/location'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  access: {
    create: superAdmins,
    read: anyone,
    update: tenantAdmins,
    delete: superAdmins,
  },
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'domain',
      type: 'text',
      required: true,
    },
    ...location
  ],
}
