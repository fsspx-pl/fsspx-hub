import { tenantAdmins } from '@/access/tenantAdmins';
import serviceFields from '@/fields/service';
import { Tenant } from '@/payload-types';
import { format } from 'date-fns';
import { revalidateTag } from 'next/cache';
import { CollectionConfig } from 'payload';


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
    read: tenantAdmins,
    create: tenantAdmins,
    update: tenantAdmins,
    delete: tenantAdmins,
  },
  admin: {
    useAsTitle: 'time',
    defaultColumns: ['date', 'time', 'category', 'massType', 'tenant'],
    group: 'Services',
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
              displayFormat: 'dd.MM.yyyy',
            },
            width: '30%',
          },
          required: true,
        },
        {
          ...serviceFields.time,
          admin: {
            ...serviceFields.time.admin,
            width: '30%',
          },
        },
        // TODO assign tenant of a currently logged in user, if has only one. Don't even show the field if only one
        {
          name: 'tenant',
          type: 'relationship',
          relationTo: 'tenants',
          required: true,
          admin: {
            width: '40%',
          },
        },
      ]
    },
    {
      type: 'row',
      fields: [
        serviceFields.category,
        serviceFields.massType,
        serviceFields.customTitle,
      ]
    },
    serviceFields.notes,
  ],
  hooks: {
    afterChange: [
      async ({ doc, req: { payload } }) => {
        // Find all pastoral announcement pages that include this service's time
        try {
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
            depth: 1,
          });

          if (!pages.docs.length) return;
          pages.docs.forEach(async (page) => {
            const domain = (page.tenant as Tenant).domain;
            const date = format(page.period.start, 'dd-MM-yyyy');
            revalidateTag(`tenant:${domain}:date:${date}`);
            payload.logger.info(`Revalidated date tag: tenant:${domain}:date:${date} due to service change`);
          });
        } catch (error) {
          payload.logger.error(`Error in Services afterChange hook: ${error}`);
        }
      }
    ]
  },
};
