import { anyone } from '@/access/anyone';
import { tenantAdmins } from '@/access/tenantAdmins';
import { CollectionConfig } from 'payload';
import { format, getISOWeek, getYear } from 'date-fns';

export const ServiceWeeks: CollectionConfig = {
  slug: 'serviceWeeks',
  labels: {
    singular: {
      pl: 'Tygodniowy porządek nabożeństw',
      en: 'Service Week Order'
    },
    plural: {
      pl: 'Tygodniowe porządki nabożeństw',
      en: 'Service Week Orders'
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
    defaultColumns: ['title', 'startDate', 'endDate', 'tenant'],
    group: 'Services',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
        hidden: true,
      },
      hooks: {
        beforeValidate: [
          ({ data }) => {
            if (data?.startDate && data?.tenant) {
              const startDate = new Date(data.startDate);
              const tenantName = typeof data.tenant === 'object' ? data.tenant.name : 'Unknown';
              return `${tenantName} - Week of ${format(startDate, 'yyyy-MM-dd')}`;
            }
            return 'New Service Week';
          }
        ]
      }
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        description: {
          pl: 'Kaplica/misja, do której należy ten tygodniowy porządek nabożeństw',
          en: 'Chapel/Mission to which this service week order belongs'
        }
      },
    },
    {
      name: 'yearWeek',
      type: 'text',
      required: true,
      label: {
        pl: 'Numer tygodnia',
        en: 'Week Number'
      },
      admin: {
        description: {
          pl: 'Format: YYYY-WW (np. 2024-13)',
          en: 'Format: YYYY-WW (e.g. 2024-13)'
        },
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          ({ data }) => {
            if (!data?.startDate) return '';
            
            const date = new Date(data.startDate);
            const year = getYear(date);
            const weekNumber = getISOWeek(date);
            
            return `${year}-${weekNumber.toString().padStart(2, '0')}`;
          }
        ]
      }
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      label: {
        pl: 'Data rozpoczęcia',
        en: 'Start Date'
      },
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'd MMM yyyy',
        },
        description: {
          pl: 'Pierwszy dzień tygodnia (zwykle niedziela)',
          en: 'First day of the week (usually Sunday)'
        }
      },
    },
    {
      name: 'endDate',
      type: 'date',
      required: true,
      label: {
        pl: 'Data zakończenia',
        en: 'End Date'
      },
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'd MMM yyyy',
        },
        description: {
          pl: 'Ostatni dzień tygodnia (zwykle sobota)',
          en: 'Last day of the week (usually Saturday)'
        }
      },
      hooks: {
        beforeValidate: [
          ({ data }) => {
            if (!data?.startDate) return '';
            
            const startDate = new Date(data.startDate);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            return endDate.toISOString();
          }
        ]
      }
    },
    {
      name: 'days',
      type: 'array',
      label: {
        pl: 'Dni',
        en: 'Days'
      },
      admin: {
        description: {
          pl: 'Porządek nabożeństw na dany dzień tygodnia',
          en: 'Service order for a given day of the week'
        }
      },
      fields: [
        {
          name: 'date',
          type: 'date',
          required: true,
          label: {
            pl: 'Data',
            en: 'Date'
          },
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
              displayFormat: 'd MMM yyyy',
            },
          },
        },
        {
          name: 'feastRank',
          type: 'select',
          required: true,
          label: {
            pl: 'Ranga święta',
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
        },
        {
          name: 'feastName',
          type: 'text',
          label: {
            pl: 'Nazwa święta',
            en: 'Feast Name'
          },
        },
        {
          name: 'services',
          type: 'relationship',
          relationTo: 'services',
          hasMany: true,
          label: {
            pl: 'Nabożeństwa',
            en: 'Services'
          },
        },
      ],
    },
  ],
}; 