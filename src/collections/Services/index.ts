import { tenantAdmins } from '@/access/tenantAdmins';
import serviceFields from '@/fields/service';
import { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionConfig } from 'payload';
import { createRevalidateServices } from './hooks/revalidateServices';

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
    read: tenantAdmins,
    create: tenantAdmins,
    update: tenantAdmins,
    delete: tenantAdmins,
  },
  admin: {
    useAsTitle: 'date',
    defaultColumns: ['date', 'category', 'massType', 'tenant'],
    group: 'Services',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'date',
          label: {
            pl: 'Data',
            en: 'Date'
          },
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
              displayFormat: 'dd.MM.yyyy HH:mm',
            },
            width: '50%',
          },
          required: true,
        },
        // TODO assign tenant of a currently logged in user, if has only one. Don't even show the field if only one
        {
          name: 'tenant',
          type: 'relationship',
          relationTo: 'tenants',
          required: true,
          admin: {
            width: '50%',
          },
        },
      ]
    },
    {
      type: 'row',
      fields: [
        serviceFields.category,
        serviceFields.massType,
        serviceFields.customTitle,
      ]
    },
    serviceFields.notes,
  ],
  hooks: {
    afterChange: [
      createRevalidateServices('Error in Services afterChange hook') as CollectionAfterChangeHook,
    ],
    afterDelete: [
      createRevalidateServices('Error in Services afterDelete hook') as CollectionAfterDeleteHook,
    ]
  }
};


