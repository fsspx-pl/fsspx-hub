
import { tenantAdmins } from '@/access/tenantAdmins'
import { tenant } from '@/fields/tenant'
import { user } from '@/fields/user'
import { period } from '@/fields/period'
import { lexicalHTML } from '@payloadcms/richtext-lexical'
import { CollectionConfig, Field } from 'payload'
import { anyone } from '../../access/anyone'
import { loggedIn } from './access/loggedIn'
import formatSlug from './hooks/formatSlug'
import { addPeriodStartDate } from './hooks/addPeriodStartDate'

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
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  access: {
    read: anyone,
    create: loggedIn,
    update: tenantAdmins,
    delete: tenantAdmins,
  },
  versions: {
    drafts: true,
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
    {
      name: 'masses',
      label: {
        pl: 'Nabożeństwa',
        en: 'Services'
      },
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      admin: {
        condition: (_, siblingData) => siblingData.type === 'pastoral-announcements',
      },
    },
    {
      name: 'slug',
      label: 'Slug',
      type: 'text',
      index: true,
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [formatSlug('title'), addPeriodStartDate],
      },
    },
    {
      ...user as Field,
      name: 'author'
    } as Field,
    tenant,
    {
      name: 'content',
      type: 'richText'
    },
    lexicalHTML('content', { name: 'content_html' }),
  ],
}
