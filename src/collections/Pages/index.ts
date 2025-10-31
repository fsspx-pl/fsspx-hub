import { tenantOnlyAccess, tenantReadOrPublic } from '@/access/byTenant'
import { revalidateTenantPages } from '@/collections/Pages/hooks/revalidateTenantPages'
import { endLocal, period, startLocal } from '@/fields/period'
import { tenant } from '@/fields/tenant'
import { endOfDay, startOfDay } from 'date-fns'
import { CollectionConfig, Field } from 'payload'
import { addPeriodStartDate } from './hooks/addPeriodStartDate'
import formatSlug from './hooks/formatSlug'
import { user } from '@/fields/user'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: {
      pl: 'Strona',
    },
    plural: {
      pl: 'Strony',
    },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'period.start', 'period.end', 'tenant.name'],
  },
  access: {
    read: tenantReadOrPublic,
    create: tenantOnlyAccess,
    update: tenantOnlyAccess,
    delete: tenantOnlyAccess,
  },
  versions: {
    drafts: {
      schedulePublish: true,
    },
  },
  fields: [
    {
      name: 'type',
      label: {
        en: 'Type',
        pl: 'Rodzaj',
      },
      type: 'select',
      options: [
        {
          label: {
            pl: 'Ogłoszenia duszpasterskie',
            en: 'Pastoral announcements'
          },
          value: 'pastoral-announcements',
        },
      ],
      defaultValue: 'pastoral-announcements',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'title',
      label: {
        en: 'Title',
        pl: 'Tytuł',
      },
      type: 'text',
      required: true,
    },
    period,
    startLocal,
    endLocal,
    { 
      name: 'slug',
      label: {
        en: 'Slug',
        pl: 'Slug',
      },
      type: 'text',
      index: true,
      admin: {
        position: 'sidebar',
        condition: (_, siblingData) => siblingData.type !== 'pastoral-announcements',
      },
      hooks: {
        beforeValidate: [formatSlug('title'), addPeriodStartDate],
      },
    },
    {
      ...user as Field,
      name: 'author'
    } as Field,
    {
      ...tenant,
      required: true,
    } as Field,
    {
      name: 'content',
      label: {
        en: 'Content',
        pl: 'Treść',
      },
      type: 'richText'
    },
    {
      name: 'newsletter',
      type: 'group',
      label: {
        en: 'Newsletter',
        pl: 'Newsletter',
      },
      admin: {
        position: 'sidebar',
        condition: (_, siblingData) => siblingData.type === 'pastoral-announcements',
      },
      fields: [
        {
          name: 'sent',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            readOnly: true,
            hidden: true,
          },
        },
        {
          name: 'test',
          type: 'ui',
          admin: {
            condition: (data) => !Boolean((data as any)?.newsletter?.sent),
            components: {
              Field: {
                path: '@/_components/admin/SendNewsletterButton/TestSendControl.tsx#TestSendControl'
              }
            }
          }
        },
        {
          name: 'send',
          type: 'ui',
          admin: {
            components: {
              Field: {
                path: '@/_components/admin/SendNewsletterButton/index.tsx#SendNewsletterButton'
              }
            }
          }
        },
      ],
    },
    {
      name: 'printActions',
      type: 'group',
      label: {
        en: 'Print',
        pl: 'Druk',
      },
      admin: {
        position: 'sidebar',
        condition: (_, siblingData) => siblingData.type === 'pastoral-announcements',
      },
      fields: [
        {
          name: 'printVersion',
          type: 'ui',
          admin: {
            components: {
              Field: {
                path: '@/_components/admin/PrintButton/index.tsx#PrintButton',
              }
            }
          }
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ operation, data }) => {
        if(operation !== 'create') return data;
        if(!data?.campaignId) return data;
        return {
          ...data,
          campaignId: undefined,
        };
      },
    ],
    beforeChange: [
      async ({ data }) => {
        if(!data?.period?.start) return data;
        return {
          ...data,
          period: { ...data.period, start: startOfDay(data.period.start), end: endOfDay(data.period.end) },
        };
      },
    ],
    afterChange: [revalidateTenantPages],
  },
}
