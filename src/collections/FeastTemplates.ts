import { anyone } from '@/access/anyone';
import { tenantAdmins } from '@/access/tenantAdmins';
import serviceFields from '@/fields/service';
import { CollectionConfig } from 'payload';

export const FeastTemplates: CollectionConfig = {
  slug: 'feastTemplates',
  labels: {
    singular: {
      pl: 'Szablon święta',
      en: 'Feast Template'
    },
    plural: {
      pl: 'Szablony świąt',
      en: 'Feast Templates'
    }
  },
  access: {
    read: anyone,
    create: tenantAdmins,
    update: tenantAdmins,
    delete: tenantAdmins,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'feastRank', 'tenant'],
    group: 'Services',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: {
        pl: 'Nazwa szablonu',
        en: 'Template Name'
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        description: {
          pl: 'Kaplica/misja, dla której ten szablon będzie używany',
          en: 'Chapel/Mission for which this template will be used'
        }
      },
    },
    {
      name: 'feastRank',
      type: 'select',
      required: true,
      label: {
        pl: 'Klasa święta',
        en: 'Feast Rank'
      },
      options: [
        { 
          label: { pl: 'I klasa', en: 'I class' }, 
          value: '1' 
        },
        { 
          label: { pl: 'II klasa', en: 'II class' }, 
          value: '2' 
        },
        { 
          label: { pl: 'III klasa', en: 'III class' }, 
          value: '3' 
        },
        { 
          label: { pl: 'IV klasa', en: 'IV class' }, 
          value: '4' 
        },
      ],
      admin: {
        description: {
          pl: 'Klasa święta, dla której ten szablon będzie używany',
          en: 'Feast rank for which this template will be used'
        }
      },
    },
    {
      name: 'services',
      type: 'array',
      label: {
        pl: 'Nabożeństwa',
        en: 'Services'
      },
      minRows: 1,
      fields: [
        ...serviceFields,
      ],
    },
  ],
}; 