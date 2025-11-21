import { CollectionConfig } from 'payload';
import { superAdmins } from '@/access/superAdmins';

export const NewsletterSubscriptions: CollectionConfig = {
  slug: 'newsletterSubscriptions',
  labels: {
    singular: {
      pl: 'Subskrypcja ogłoszeń duszpasterskich',
      en: 'Pastoral Announcements Subscription',
    },
    plural: {
      pl: 'Subskrypcje ogłoszeń duszpasterskich',
      en: 'Pastoral Announcements Subscriptions',
    },
  },
  access: {
    read: superAdmins,
    create: () => true, // Allow API to create subscriptions
    update: superAdmins,
    delete: superAdmins,
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'tenant', 'status', 'updatedAt'],
  },
  fields: [
    {
      name: 'email',
      label: {
        en: 'Email',
        pl: 'Email',
      },
      type: 'email',
      required: true,
      index: true,
    },
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
      name: 'status',
      label: {
        en: 'Status',
        pl: 'Status',
      },
      type: 'select',
      options: [
        {
          label: {
            en: 'Pending',
            pl: 'Oczekuje',
          },
          value: 'pending',
        },
        {
          label: {
            en: 'Confirmed',
            pl: 'Potwierdzona',
          },
          value: 'confirmed',
        },
        {
          label: {
            en: 'Unsubscribed',
            pl: 'Rezygnacja',
          },
          value: 'unsubscribed',
        },
      ],
      defaultValue: 'pending',
      required: true,
      index: true,
    },
  ],
};

