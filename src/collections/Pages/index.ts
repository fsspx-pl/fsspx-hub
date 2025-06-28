import { tenantAdmins } from '@/access/tenantAdmins'
import { revalidateTenantPages } from '@/collections/Pages/hooks/revalidateTenantPages'
import { endLocal, period, startLocal } from '@/fields/period'
import { tenant } from '@/fields/tenant'
import { user } from '@/fields/user'
import { lexicalHTML } from '@payloadcms/richtext-lexical'
import { CollectionConfig, Field } from 'payload'
import { anyone } from '../../access/anyone'
import { loggedIn } from './access/loggedIn'
import { addPeriodStartDate } from './hooks/addPeriodStartDate'
import formatSlug from './hooks/formatSlug'
import { endOfDay } from 'date-fns'
import { startOfDay } from 'date-fns'

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
    defaultColumns: ['title', 'type', 'period.start', 'period.end'],
  },
  access: {
    read: anyone,
    create: loggedIn,
    update: tenantAdmins,
    delete: tenantAdmins,
  },
  versions: {
    drafts: {
      schedulePublish: true,
    },
  },
  fields: [
    {
      name: 'type',
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
      type: 'text',
      required: true,
    },
    period,
    startLocal,
    endLocal,
    { 
      name: 'slug',
      label: 'Slug',
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
      name: 'campaignId',
      type: 'text',
      label: 'Campaign ID from the campaign API provider',
      defaultValue: '',
      admin: {
        position: 'sidebar',
        readOnly: true,
        hidden: true,
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
      type: 'richText'
    },
    lexicalHTML('content', { name: 'content_html' }),
    {
      name: 'sendNewsletter',
      type: 'ui',
      admin: {
        position: 'sidebar',
        condition: (_, siblingData) => siblingData.type === 'pastoral-announcements',
        components: {
          Field: {
            path: '@/_components/admin/SendNewsletterButton/index.tsx#SendNewsletterButton'
          }
        }
      }
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
