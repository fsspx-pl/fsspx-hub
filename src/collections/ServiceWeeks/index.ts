import { anyone } from '@/access/anyone';
import { tenantAdmins } from '@/access/tenantAdmins';
import { getFeasts } from '@/common/getFeasts';
import { polishTimeToUtc } from '@/common/timezone';
import { Feast } from '@/feast';
import { Service, ServiceWeek, Tenant } from '@/payload-types';
import { addWeeks, endOfWeek, getDay, getISOWeek, isSunday, parseISO, startOfWeek } from 'date-fns';
import { CollectionConfig } from 'payload';
import { tenantOnlyAccess, tenantReadOrPublic } from '@/access/byTenant';
import { revalidateTag } from 'next/cache';

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
      pl: 'Porządek Tygodniowy',
      en: 'Service Week Order'
    },
    plural: {
      pl: 'Porządki Tygodniowe',
      en: 'Service Week Order'
    }
  },
  access: {
    read: tenantReadOrPublic,
    create: tenantOnlyAccess,
    update: tenantOnlyAccess,
    delete: tenantOnlyAccess,
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
        
        const feasts = await getFeasts(startDate, endDate);
        const feastsByDay = feasts.reduce((acc: FeastsByDay, feast) => {
          const dayOfWeek = getDay(feast.date);
          if (!acc[dayOfWeek]) acc[dayOfWeek] = [];
          acc[dayOfWeek].push(feast);
          return acc;
        }, {});
        
        const updatedData: any = { ...data };
        
        for (const [dayNumber, dayFeasts] of Object.entries(feastsByDay)) {
          const dayNum = Number(dayNumber);
          const tabName = dayMap[dayNum];
          const services = [];
          
          for (const feast of dayFeasts) {
            const feastTemplates = tenant?.feastTemplates;
            
            if (!feastTemplates) continue;
            
            const templateKey = dayNum === 0 ? 'sunday' : 'otherDays';
            const template = feastTemplates[templateKey];
            
            if (!template?.services?.length) continue;

            for (const templateService of template.services) {
              const utcDate = polishTimeToUtc(feast.date);
              
              const serviceData = {
                tenant: data.tenant,
                date: utcDate.toISOString(),
                time: templateService.time,
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
    afterChange: [
      ({ doc }) => revalidateTag(`tenant:${doc.tenant}:services`)
    ],
    afterDelete: [
      // Delete all associated services when a ServiceWeek is deleted
      async ({ req, id }) => {
        try {
          // First, fetch the ServiceWeek to get all service IDs
          const serviceWeek = await req.payload.findByID({
            collection: 'serviceWeeks',
            id
          }) as ServiceWeek;
          
          if (!serviceWeek) return;
          
          // Collect all service IDs from all days
          const serviceIds: string[] = [];
          
          // Extract service IDs from each day that has services
          ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
            const dayKey = day as keyof ServiceWeek;
            const dayData = serviceWeek[dayKey];
            
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
          
          // Delete all collected services
          if (serviceIds.length > 0) {
            req.payload.logger.info(`Deleting ${serviceIds.length} services associated with ServiceWeek ${id}`);
            
            // Delete each service
            for (const serviceId of serviceIds) {
              await req.payload.delete({
                collection: 'services',
                id: serviceId
              });
            }
          }
        } catch (error) {
          req.payload.logger.error(`Error deleting associated services for ServiceWeek ${id}: ${error}`);
        }
      }
    ]
  },
  fields: [
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
        description: {
          pl: 'Kaplica/misja, do której przypisany jest Porządek tygodniowy',
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
        pl: 'Początek tygodnia',
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
              label: {
                en: 'Services',
                pl: 'Nabożeństwa',
              },
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
              label: {
                en: 'Services',
                pl: 'Nabożeństwa',
              },
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
              label: {
                en: 'Services',
                pl: 'Nabożeństwa',
              },
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
              label: {
                en: 'Services',
                pl: 'Nabożeństwa',
              },
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
              label: {
                en: 'Services',
                pl: 'Nabożeństwa',
              },
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
              label: {
                en: 'Services',
                pl: 'Nabożeństwa',
              },
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
              label: {
                en: 'Services',
                pl: 'Nabożeństwa',
              },
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