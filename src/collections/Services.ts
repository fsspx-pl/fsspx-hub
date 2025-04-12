import { anyone } from '@/access/anyone';
import { tenantAdmins } from '@/access/tenantAdmins';
import { CollectionConfig } from 'payload';
import { revalidateTag } from 'next/cache';
import { getPayload } from 'payload';
import config from '@payload-config';
import { Tenant } from '@/payload-types';
import { format } from 'date-fns';

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
  admin: {
    useAsTitle: 'time',
    defaultColumns: ['time', 'type', 'tenant'],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'time',
          label: {
            pl: 'Data i czas',
            en: 'Date and time'
          },
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
              displayFormat: 'd MMM yyyy, HH:mm',
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
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { 
          label: {
            pl: 'Msza Święta',
            en: 'Holy Mass',
          }, 
          value: 'mass' 
        },
        { 
          label: {
            pl: 'Różaniec',
            en: 'Rosary',
          }, 
          value: 'rosary' 
        },
        { 
          label: {
            pl: 'Gorzkie Żale',
            en: 'Lamentations',
          }, 
          value: 'lamentations' 
        },
        { 
          label: {
            pl: 'Inne',
            en: 'Other',
          }, 
          value: 'other' 
        },
      ],
    },
    {
      name: 'massType',
      type: 'select',
      required: true,
      options: [
        { 
          label: {
            pl: 'Śpiewana',
            en: 'Sung',
          }, 
          value: 'sung' 
        },
        { 
          label: {
            pl: 'Czytana',
            en: 'Read',
          }, 
          value: 'read' 
        },
        { 
          label: {
            pl: 'Cicha',
            en: 'Silent',
          }, 
          value: 'silent' 
        },
        { 
          label: {
            pl: 'Solenna',
            en: 'Solemn',
          }, 
          value: 'solemn' 
        },
      ],
      admin: {
        condition: (data) => data?.category === 'mass',
        description: {
          pl: 'Typ Mszy Świętej, który będzie widoczny w kalendarzu oraz w newsletterze',
          en: 'Holy Mass type, visible in the calendar and newsletter'
        }
      },
    },
    {
      name: 'customTitle',
      type: 'text',
      required: true,
      
      label: {
        pl: 'Nazwa nabożeństwa',
        en: 'Service title'
      },
      admin: {
        condition: (data) => data?.category === 'other',
        description: {
          pl: 'Nazwa nabożeństwa, która będzie widoczna w kalendarzu oraz w newsletterze',
          en: 'Service title, visible in the calendar and newsletter'
        }
      },
    },
    {
      name: 'notes',
      type: 'text',
      label: {
        pl: 'Dodatkowe informacje',
        en: 'Notes'
      },
      admin: {
        description: {
          pl: 'Dodatkowe informacje o nabożeństwie, które będą widoczne w kalendarzu poniej tytułu nabożeństwa oraz w newsletterze',
          en: 'Additional information about the service, visible below the service title in the calendar and newsletter'
        }
      }
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc }) => {
        const payload = await getPayload({ config });
        
        // Find all pastoral announcement pages that include this service's time, by definition there should be only one such page
        const pages = await payload.find({
          collection: 'pages',
          where: {
            and: [
              {
                type: {
                  equals: 'pastoral-announcements'
                }
              },
              {
                'period.start': {
                  less_than_equal: doc.time
                }
              },
              {
                'period.end': {
                  greater_than_equal: doc.time
                }
              }
            ]
          },
          depth: 2,
          limit: 1,
        });

        const [ page ] = pages.docs;
        if (!page) return;
        const domain = (page.tenant as Tenant).domain;
        const date = format(page.period.start, 'dd-MM-yyyy');
        revalidateTag(`page-${domain}-${date}`);
      }
    ]
  },
};
