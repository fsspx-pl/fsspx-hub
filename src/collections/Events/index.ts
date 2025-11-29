import { tenantOnlyAccess, tenantReadOrPublic } from '@/access/byTenant';
import { tenant } from '@/fields/tenant';
import { createEventSlug } from '@/utilities/createEventSlug';
import configPromise from '@payload-config';
import { CollectionConfig, Field, getPayload } from 'payload';

export const Events: CollectionConfig = {
  slug: 'events',
  labels: {
    singular: {
      pl: 'Wydarzenie',
      en: 'Event',
    },
    plural: {
      pl: 'Wydarzenia',
      en: 'Events',
    },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'tenant', 'startDate', 'endDate'],
  },
  access: {
    read: tenantReadOrPublic,
    create: tenantOnlyAccess,
    update: tenantOnlyAccess,
    delete: tenantOnlyAccess,
  },
  
  fields: [
    {
      ...tenant,
      required: true,
    } as Field,
    {
      name: 'title',
      label: {
        en: 'Title',
        pl: 'Tytuł',
      },
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      label: {
        en: 'Slug',
        pl: 'Slug',
      },
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: {
          pl: 'Automatycznie generowany slug w formacie: nazwa-hash',
          en: 'Auto-generated slug in format: name-hash',
        },
      },
      hooks: {
        beforeValidate: [
          async ({ data, operation }) => {
            // Only generate slug on create; never change it on update
            if (operation !== 'create') {
              return data?.slug;
            }

            const baseSlugSource = data?.slug;
            if (!baseSlugSource) {
              return data?.slug;
            }

            const payload = await getPayload({ config: configPromise });
            const tenantId = typeof data.tenant === 'string' ? data.tenant : data.tenant?.id;

            if (!tenantId) {
              return data?.slug;
            }

            // Use existing slug (or title) and just append a base62 hash suffix
            let slug = createEventSlug(baseSlugSource);
            let counter = 0;
            const maxAttempts = 10;

            // Ensure uniqueness within tenant
            while (counter < maxAttempts) {
              const existing = await payload.find({
                collection: 'events',
                where: {
                  and: [
                    { slug: { equals: slug } },
                    { tenant: { equals: tenantId } },
                  ],
                },
                limit: 1,
              });

              if (existing.docs.length === 0) {
                return slug;
              }

              counter++;
              slug = createEventSlug(baseSlugSource);
            }

            return slug;
          },
        ],
      },
    },
    {
      name: 'startDate',
      label: {
        en: 'Start Date',
        pl: 'Data rozpoczęcia',
      },
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'endDate',
      label: {
        en: 'End Date',
        pl: 'Data zakończenia',
      },
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'form',
      label: {
        en: 'Form',
        pl: 'Formularz',
      },
      type: 'relationship',
      relationTo: 'forms',
      required: true,
      admin: {
        description: {
          pl: 'Formularz używany do zapisów na wydarzenie',
          en: 'Form used for event signups',
        },
      },
    },
    {
      name: 'heroImage',
      label: {
        en: 'Hero Image',
        pl: 'Zdjęcie główne',
      },
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'content',
      label: {
        en: 'Content',
        pl: 'Treść',
      },
      type: 'richText',
      admin: {
        description: {
          pl: 'Szczegółowy opis wydarzenia wyświetlany na stronie',
          en: 'Detailed event description displayed on the page',
        },
      },
    },
  ],
};

