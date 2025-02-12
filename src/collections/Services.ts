import { anyone } from '@/access/anyone';
import { tenantAdmins } from '@/access/tenantAdmins';
import { CollectionConfig } from 'payload';

export const Services: CollectionConfig = {
  slug: 'services',
  labels: {
    singular: {
      pl: 'Nabożeństwo',
      en: 'Service'
    },
    plural: {
      pl: 'Nabożeństwa',
      en: 'Services'
    }
  }, 
  access: {
    // TODO make this more secure, only a member of a given tenant should be able to do this
    read: anyone,
    create: tenantAdmins,
    update: tenantAdmins,
    delete: tenantAdmins,
  },
  fields: [
    {
      name: 'time',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'd MMM yyyy, HH:mm'
        },
      },
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: {
            pl: 'Śpiewana',
            en: 'Sung',
        }, value: 'sung' },
        { label: {
            pl: 'Czytana',
            en: 'Read',
        }, value: 'read' },
        { label: {
            pl: 'Cicha',
            en: 'Silent',
        }, value: 'silent' },
      ],
      required: true,
    },
    // TODO assign tenant of a currently logged in user, if has only one. Don't even show the field if only one
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
    },
    {
      name: 'priest',
      type: 'relationship',
      relationTo: 'users',
    },
  ],
};
