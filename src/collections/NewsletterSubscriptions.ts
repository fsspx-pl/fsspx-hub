import { CollectionConfig } from 'payload';
import { superAdmins } from '@/access/superAdmins';

export const NewsletterSubscriptions: CollectionConfig = {
  slug: 'newsletterSubscriptions',
  labels: {
    singular: {
      pl: 'Subskrypcja newslettera',
      en: 'Newsletter Subscription',
    },
    plural: {
      pl: 'Subskrypcje newslettera',
      en: 'Newsletter Subscriptions',
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
    defaultColumns: ['email', 'subdomain', 'status', 'createdAt', 'confirmedAt'],
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
      name: 'subdomain',
      label: {
        en: 'Subdomain',
        pl: 'Subdomena',
      },
      type: 'text',
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
      ],
      defaultValue: 'pending',
      required: true,
      index: true,
    },
    {
      name: 'confirmedAt',
      label: {
        en: 'Confirmed At',
        pl: 'Potwierdzono',
      },
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
};

