import { anyone } from '@/access/anyone';
import { tenantAdmins } from '@/access/tenantAdmins';
import { getFeasts } from '@/common/getFeasts';
import { Feast } from '@/feast';
import { Service, ServiceWeek, Tenant } from '@/payload-types';
import { addDays, addWeeks, endOfWeek, getDay, getISOWeek, isSunday, parseISO, setHours, setMinutes, startOfWeek } from 'date-fns';
import { CollectionConfig } from 'payload';

// Define type for feast days grouped by day of week
interface FeastsByDay {
  [key: number]: Feast[];
}

// Type for the day object in ServiceWeek
interface ServiceWeekDay {
  services?: Array<{
    service: string | Service;
    id?: string | null;
  }> | null;
}

const dayMap: Record<number, string> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday'
};

export const ServiceWeeks: CollectionConfig = {
  slug: 'serviceWeeks',
  labels: {
    singular: {
      pl: 'Tygodniowy porządek nabożeństw',
      en: 'Week Order'
    },
    plural: {
      pl: 'Tygodniowe porządki nabożeństw',
      en: 'Week Orders'
    }
  },
  access: {
    read: anyone,
    create: tenantAdmins,
    update: tenantAdmins,
    delete: tenantAdmins,
  },
  admin: {
    useAsTitle: 'yearWeek',
    defaultColumns: ['yearWeek', 'start', 'tenant'],
    group: 'Services',
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation !== 'create') return data;

        const { start, end, tenant: tenantId } = data;
        if (!start || !end || !tenantId) return data;
        
        const startDate = typeof start === 'string' ? parseISO(start) : start;
        const endDate = typeof end === 'string' ? parseISO(end) : end;

        const tenant = await req.payload.findByID({
          collection: 'tenants',
          id: tenantId,
          depth: 2
        }) as Tenant;

        if (!tenant) return data;
        
        // skip first Sunday and span across the next one
        const feasts = await getFeasts(addDays(startDate, 1), addDays(endDate, 1));
        const feastsByDay = feasts.reduce((acc: FeastsByDay, feast) => {
          const dayOfWeek = getDay(feast.date);
          if (!acc[dayOfWeek]) acc[dayOfWeek] = [];
          acc[dayOfWeek].push(feast);
          return acc;
        }, {});
        
        const updatedData: any = { ...data };
        
        for (const [dayNumber, dayFeasts] of Object.entries(feastsByDay)) {
          const tabName = dayMap[Number(dayNumber)];
          const services = [];
          
          for (const feast of dayFeasts) {
            const feastTemplates = tenant?.feastTemplates;
            
            if (!feastTemplates) continue;

            const templatesArray = Object.values(feastTemplates);
            const template = templatesArray.find(template => {
              const applicableDays = template.applicableDays as number[];
              return applicableDays?.includes(getDay(feast.date));
            });
            
            if (!template?.services?.length) continue;

            for (const templateService of template.services) {
              const hours = parseISO(templateService.time).getHours();
              const minutes = parseISO(templateService.time).getMinutes();
              const serviceData = {
                tenant: data.tenant,
                date: setHours(setMinutes(feast.date, minutes), hours).toISOString(),
                category: templateService.category,
                massType: templateService.massType,
                notes: templateService.notes,
              };
              
              try {
                const newService = await req.payload.create({
                  collection: 'services',
                  data: serviceData
                });
                
                services.push({
                  service: newService.id
                });
              } catch (error) {
                req.payload.logger.error(`Failed to create service: ${error}`);
              }
            }
          }
          
          // Update tab with the new services
          if (services.length > 0) {
            updatedData[tabName] = {
              ...(updatedData[tabName] || {}),
              services
            };
          }
        }
        
        return updatedData;
      }
    ],
    afterDelete: [
      // Delete all associated services when a ServiceWeek is deleted
      async ({ doc, req }) => {
        try {
          const serviceIds: string[] = [];
          const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
          
          // Extract service IDs from each day that has services
          DAYS.forEach(day => {
            const dayKey = day as keyof ServiceWeek;
            const dayData = doc[dayKey];
            
            // Check if dayData exists and has services property
            if (dayData && typeof dayData === 'object' && 'services' in dayData) {
              const dayServices = (dayData as ServiceWeekDay).services;
              
              if (Array.isArray(dayServices)) {
                dayServices.forEach(serviceRef => {
                  if (typeof serviceRef.service === 'string') {
                    serviceIds.push(serviceRef.service);
                  } else if (serviceRef.service?.id) {
                    serviceIds.push(serviceRef.service.id);
                  }
                });
              }
            }
          });
          
          if (!serviceIds.length) return;  
          await req.payload.delete({
            collection: 'services',
            where: {
              id: {
                in: serviceIds
              }
            }
          });
          req.payload.logger.info(`Deleted ${serviceIds.length} services associated with ServiceWeek ${doc.id}`);
        } catch (error) {
          req.payload.logger.error(`Error deleting associated services for ServiceWeek ${doc.id}: ${error}`);
        }
      }
    ]
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        description: {
          pl: 'Kaplica/misja, do której przypisany jest tygodniowy porządek nabożeństw',
          en: 'Chapel/Mission to which this service week order is assigned'
        },
        position: 'sidebar',
      },
    },
    {
      name: 'start',
      type: 'date',
      required: true,
      label: {
        pl: 'Rozpoczęcie tygodnia',
        en: 'Start of the week'
      },
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'd MMM yyyy',
        },
        description: {
          pl: 'Pierwszy dzień tygodnia (musi być to niedziela)',
          en: 'First day of the week (must be Sunday)'
        },
      },
      validate: (value: Date | null | undefined) => {
        if (!isSunday(value as Date)) {
          return 'First day of the week must be Sunday'
        }
        return true
      },
      defaultValue: async ({ req }) => {
        const payload = req.payload;
        
        const result = await payload.find({
          collection: 'serviceWeeks',
          sort: '-yearWeek',
          limit: 1
        });

        const lastServiceWeek = result?.docs?.[0];

        if (!lastServiceWeek) {
          return startOfWeek(new Date(), { weekStartsOn: 0 });
        }

        const nextWeekDate = addWeeks(parseISO(lastServiceWeek.start), 1);
        return startOfWeek(nextWeekDate, { weekStartsOn: 0 });
      }
    },
    {
      name: 'end',
      type: 'date',
      admin: {
        hidden: true,
      },
      hooks: {
        beforeValidate: [
          ({ data }) => {
            if (!data?.start) return;
            const start = new Date(data.start);
            return endOfWeek(start, { weekStartsOn: 0 });
          }
        ]
      }
    },
    {
      name: 'yearWeek',
      type: 'number',
      label: {
        pl: 'Numer tygodnia',
        en: 'Week Number'
      },
      admin: {
        hidden: true,
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          ({ siblingData }) => {
            return getISOWeek(siblingData?.start);
          }
        ]
      }
    },
    {
      type: 'tabs',
      tabs: [
        {
          name: 'monday',
          label: {
            pl: 'Poniedziałek',
            en: 'Monday'
          },
          fields: [
            {
              name: 'services',
              type: 'array',
              fields: [
                { name: 'service', type: 'relationship', relationTo: 'services' }
              ]
            }
          ]
        },
        {
          name: 'tuesday',
          label: {
            pl: 'Wtorek',
            en: 'Tuesday'
          },
          fields: [
            {
              name: 'services',
              type: 'array',
              fields: [
                { name: 'service', type: 'relationship', relationTo: 'services' }
              ]
            }
          ]
        },
        {
          name: 'wednesday',
          label: {
            pl: 'Środa',
            en: 'Wednesday'
          },
          fields: [
            {
              name: 'services',
              type: 'array',
              fields: [
                { name: 'service', type: 'relationship', relationTo: 'services' }
              ]
            }
          ]
        },
        {
          name: 'thursday',
          label: {
            pl: 'Czwartek',
            en: 'Thursday'
          },
          fields: [
            {
              name: 'services',
              type: 'array',
              fields: [
                { name: 'service', type: 'relationship', relationTo: 'services' }
              ]
            }
          ]
        },
        {
          name: 'friday',
          label: {
            pl: 'Piątek',
            en: 'Friday'
          },
          fields: [
            {
              name: 'services',
              type: 'array',
              fields: [
                { name: 'service', type: 'relationship', relationTo: 'services' }
              ]
            }
          ]
        },
        {
          name: 'saturday',
          label: {
            pl: 'Sobota',
            en: 'Saturday'
          },
          fields: [
            {
              name: 'services',
              type: 'array',
              fields: [
                { name: 'service', type: 'relationship', relationTo: 'services' }
              ]
            }
          ]
        },
        {
          name: 'sunday',
          label: {
            pl: 'Niedziela',
            en: 'Sunday'
          },
          fields: [
            {
              name: 'services',
              type: 'array',
              fields: [
                { name: 'service', type: 'relationship', relationTo: 'services' }
              ]
            }
          ]
        }
      ],
    },
  ],
}; 