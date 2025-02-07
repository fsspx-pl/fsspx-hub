import { CollectionConfig } from 'payload';

export const Masses: CollectionConfig = {
  slug: 'masses',
  access: {
    // TODO make this more secure, only a member of a given tenant should be able to do this
    read: () => true,
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
