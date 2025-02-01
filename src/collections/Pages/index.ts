
import { tenant } from '@/fields/tenant'
import { user } from '@/fields/user'
import { CollectionConfig, Field } from 'payload'
import { anyone } from '../../access/anyone'
import { loggedIn } from './access/loggedIn'
import formatSlug from './hooks/formatSlug'
import { tenantAdmins } from '@/access/tenantAdmins'
import { richText } from 'payload/shared'
import { lexicalHTML } from '@payloadcms/richtext-lexical'

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
      name: 'title',
      type: 'text',
      required: true,
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
        beforeValidate: [formatSlug('title')],
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
