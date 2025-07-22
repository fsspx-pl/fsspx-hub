import { tenantAdmins } from '@/access/tenantAdmins';
import { formatInPolishTime } from '@/common/timezone';
import serviceFields from '@/fields/service';
import { Service } from '@/payload-types';
import capitalizeFirstLetter from '@/utilities/capitalizeFirstLetter';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionConfig, FieldHook } from 'payload';
import { createRevalidateServices } from './hooks/revalidateServices';

const dayNameHook: FieldHook<Service> = ({ data }) => {
  if (!data?.date) return null;
  const dayName = format(new Date(data.date), 'EEEE', { locale: pl });
  return capitalizeFirstLetter(dayName);
};

const serviceTitleHook: FieldHook<Service> = ({ data }) => {
  if (!data?.date) return null;
  
  const dateStr = formatInPolishTime(data.date, 'dd.MM HH:mm');
  const category = capitalizeFirstLetter(data.category || '');
  const massType = data.massType ? ` - ${capitalizeFirstLetter(data.massType)}` : '';
  
  return `${dateStr} - ${category}${massType}`;
};

export const Services: CollectionConfig = {
  slug: 'services',
  labels: {
    singular: {
      pl: 'Nabożeństwo',
      en: 'Service'
    },
    plural: {
      pl: 'Wszystkie nabożeństwa',
      en: 'All services'
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
    useAsTitle: 'serviceTitle',
    defaultColumns: ['serviceTitle', 'dayName', 'category', 'massType', 'tenant'],
    group: {
      pl: 'Nabożeństwa',
      en: 'Services',
    },
    description: {
      pl: 'Lista wszystkich nabożeństw, które są generowane automatycznie na podstawie kolejnego tygodnia dodanego w menu: Porządek Tygodniowy. Każde z nabożenstw może być indywidualnie edytowane.',
      en: 'List of all services, which are automatically generated based on the Week Order. Each service can be edited individually.'
    },
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
              pickerAppearance: 'dayAndTime',
              displayFormat: 'dd.MM.yyyy HH:mm',
            },
            width: '50%',

          },
          required: true,
        },
        // TODO assign tenant of a currently logged in user, if has only one. Don't even show the field if only one
        {
          name: 'tenant',
          label: {
            en: 'Tenant',
            pl: 'Lokalizacja',
          },
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
      name: 'dayName',
      type: 'text',
      label: {
        pl: 'Dzień tygodnia',
        en: 'Day of week'
      },
      admin: {
        hidden: true,
      },
      hooks: {
        beforeChange: [
          ({ siblingData }) => {
            delete siblingData.dayName;
          }
        ],
        afterRead: [dayNameHook]
      }
    },
    {
      name: 'serviceTitle',
      type: 'text',
      label: {
        pl: 'Tytuł nabożeństwa',
        en: 'Service title'
      },
      admin: {
        hidden: true,
      },
      hooks: {
        beforeChange: [
          ({ siblingData }) => {
            delete siblingData.serviceTitle;
          }
        ],
        afterRead: [serviceTitleHook]
      }
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
      createRevalidateServices('Error in Services afterChange hook') as CollectionAfterChangeHook,
    ],
    afterDelete: [
      createRevalidateServices('Error in Services afterDelete hook') as CollectionAfterDeleteHook,
    ]
  }
};


