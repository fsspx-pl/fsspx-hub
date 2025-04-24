import { anyone } from '@/access/anyone';
import { tenantAdmins } from '@/access/tenantAdmins';
import serviceFields from '@/fields/service';
import { Tenant } from '@/payload-types';
import config from '@payload-config';
import { format } from 'date-fns';
import { revalidateTag } from 'next/cache';
import { CollectionConfig, getPayload } from 'payload';


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
    defaultColumns: ['date', 'time', 'category', 'massType', 'tenant'],
    hidden: true,
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
              pickerAppearance: 'dayOnly',
              displayFormat: 'dd-MM-yyyy',
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
    ...serviceFields,
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
