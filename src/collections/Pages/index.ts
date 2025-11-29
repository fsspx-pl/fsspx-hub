import { tenantOnlyAccess, tenantReadOrPublic } from '@/access/byTenant'
import { revalidateTenantPages } from '@/collections/Pages/hooks/revalidateTenantPages'
import { resetNewsletterSentOnCreate } from '@/collections/Pages/hooks/resetNewsletterSentOnCreate'
import { normalizePeriodDates } from '@/collections/Pages/hooks/normalizePeriodDates'
import { endLocal, period, startLocal } from '@/fields/period'
import { tenant } from '@/fields/tenant'
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
    {
      name: 'relatedEvents',
      label: {
        en: 'Related Events',
        pl: 'Powiązane wydarzenia',
      },
      type: 'relationship',
      relationTo: 'events',
      hasMany: true,
      maxRows: 5,
      admin: {
        position: 'sidebar',
        description: {
          pl: 'Wybierz maksymalnie 5 powiązanych wydarzeń. Upewnij się, że wybrane wydarzenia należą do tej samej lokalizacji.',
          en: 'Select up to 5 related events. Ensure selected events belong to the same tenant.',
        },
      },
    },
  ],
  hooks: {
    beforeChange: [
      resetNewsletterSentOnCreate,
      normalizePeriodDates,
    ],
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
    afterChange: [revalidateTenantPages],
  },
}
