import { anyone } from '@/access/anyone';
import { tenantAdmins } from '@/access/tenantAdmins';
import { getFeasts } from '@/common/getFeasts';
import { formatInPolishTime } from '@/common/timezone';
import { Feast } from '@/feast';
import { Service, ServiceWeek, Tenant } from '@/payload-types';
import { addDays, addWeeks, endOfWeek, getDay, getISOWeek, parseISO, startOfWeek } from 'date-fns';
import { CollectionConfig, Payload } from 'payload';

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

type FeastTemplate = NonNullable<Tenant['feastTemplates']>[keyof NonNullable<Tenant['feastTemplates']>];

/**
 * Finds the appropriate service template for a given feast.
 * @param feast - The feast to find a template for.
 * @param templates - The available feast templates from the tenant.
 * @returns The matching template or undefined.
 */
const findTemplateForFeast = (feast: Feast, templates: Tenant['feastTemplates']): FeastTemplate | undefined => {
  if (!templates) return undefined;

  console.log(`\nFinding template for feast: "${feast.title}"`);
  console.log(`Feast date: ${feast.date.toISOString()}`);
  console.log(`Feast Polish date: ${formatInPolishTime(feast.date, 'yyyy-MM-dd HH:mm:ss')}`);
  
  const availableTemplates = Object.entries(templates).map(([name, template]) => ({
    name,
    ...template
  }));
  console.log('Available templates:', availableTemplates);
  
  for (const template of availableTemplates) {
    const applicableDays = (template.applicableDays || []) as number[];
    const dayOfWeek = getDay(new Date(formatInPolishTime(feast.date, 'yyyy-MM-dd')));
    console.log(`Checking ${template.name} template with applicable days:`, applicableDays, 'against day:', dayOfWeek);
    console.log(`Match result:`, applicableDays.includes(dayOfWeek));
    
    if (applicableDays.includes(dayOfWeek)) {
      console.log(`Found specific template for ${feast.title}: ${template.name} with days:`, applicableDays);
      return template;
    }
  }
  return undefined;
};

/**
 * Creates a collection of services for a given feast based on a template.
 * @param feast - The feast to generate services for.
 * @param template - The service template to use.
 * @param tenantId - The ID of the tenant.
 * @param payload - The Payload instance.
 * @returns A promise that resolves to an array of service references.
 */
const createServicesForFeast = async (
  feast: Feast,
  template: FeastTemplate,
  tenantId: string,
  payload: Payload
): Promise<{ service: string }[]> => {
  if (!template?.services?.length) return [];

  const servicePromises = template.services.map(async (templateService) => {
    if (!templateService) return null;
    
    const timeString = templateService.time as string;
    const timeMatch = timeString.match(/(\d{2}):(\d{2})/);

    if (!timeMatch) {
      payload.logger.error(`Invalid time format in template: ${timeString} for feast: ${feast.title}`);
      return null;
    }

    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);

    // Create date in Polish timezone
    const polishDate = formatInPolishTime(feast.date, 'yyyy-MM-dd');
    const serviceDate = new Date(`${polishDate}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
    
    // Convert to UTC for storage
    const utcDate = new Date(serviceDate.getTime() - serviceDate.getTimezoneOffset() * 60000);

    const serviceData = {
      tenant: tenantId,
      date: utcDate.toISOString(),
      category: templateService.category,
      massType: templateService.massType,
      notes: templateService.notes,
    };

    try {
      const newService = await payload.create({ collection: 'services', data: serviceData });
      return { service: newService.id };
    } catch (error) {
      payload.logger.error(`Failed to create service for feast ${feast.title}: ${error}`);
      return null;
    }
  });

  const createdServices = await Promise.all(servicePromises);
  return createdServices.filter(Boolean) as { service: string }[];
};

export const ServiceWeeks: CollectionConfig = {
  slug: 'serviceWeeks',
  labels: {
    singular: {
      pl: 'Porządek Tygodniowy',
      en: 'Week Order'
    },
    plural: {
      pl: 'Porządki Tygodniowe',
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
    group: {
      pl: 'Nabożeństwa',
      en: 'Services',
    },
    description: {
      pl: 'Dodanie nowego tygodnia powoduje automatyczne generowanie nabożeństw na podstawie szablonu nabożeństw dla danego dnia, dostępnego w ustawieniach: Lokalizacja -> Szablony nabożeństw dla danego dnia tygodnia.',
      en: 'Adding a new week automatically generates services based on the service template for that day, available in the Tenant settings.',
    },
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
        
        // Get feasts for the week
        const feasts = await getFeasts(startDate, endDate);
        console.log('Feasts received:', feasts.map((f: Feast) => ({
          title: f.title,
          date: f.date.toISOString(),
          day: getDay(f.date),
          polishDate: formatInPolishTime(f.date, 'yyyy-MM-dd HH:mm:ss')
        })));

        const feastsByDay = feasts.reduce<FeastsByDay>((acc, feast) => {
          // Convert UTC date to Polish time before getting the day
          const polishDate = formatInPolishTime(feast.date, 'yyyy-MM-dd');
          const dayOfWeek = getDay(new Date(polishDate));
          console.log(`Grouping feast "${feast.title}" (${feast.date.toISOString()} -> ${polishDate}) into day ${dayOfWeek} (${dayMap[dayOfWeek]})`);
          if (!acc[dayOfWeek]) acc[dayOfWeek] = [];
          acc[dayOfWeek].push(feast);
          return acc;
        }, {});

        console.log('Feasts grouped by day:', Object.entries(feastsByDay).map(([day, feasts]) => ({
          day: dayMap[Number(day)],
          feasts: feasts.map((feast: Feast) => feast.title)
        })));
        
        const updatedData: any = { ...data };
        
        // Process days starting from Monday (1) to Sunday (0)
        const dayOrder = [1, 2, 3, 4, 5, 6, 0]; // Monday to Sunday
        for (const dayNumber of dayOrder) {
          const dayFeasts = feastsByDay[dayNumber] || [];
          console.log(`Processing ${dayMap[dayNumber]} with ${dayFeasts.length} feasts`);
          
          const servicePromises = dayFeasts.map((feast: Feast) => {
            const template = findTemplateForFeast(feast, tenant.feastTemplates);
            if (!template) return Promise.resolve([]);
            return createServicesForFeast(feast, template, tenant.id, req.payload);
          });
          
          const servicesForDay = (await Promise.all(servicePromises)).flat();

          if (servicesForDay.length > 0) {
            const tabName = dayMap[dayNumber];
            console.log(`Assigning ${servicesForDay.length} services to ${tabName}`);
            updatedData[tabName] = {
              ...(updatedData[tabName] || {}),
              services: servicesForDay,
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
      label: {
        en: 'Tenant',
        pl: 'Lokalizacja',
      },
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
          pl: 'Pierwszy dzień tygodnia (musi być to poniedziałek)',
          en: 'First day of the week (must be Monday)'
        },
      },
      validate: (value: Date | null | undefined) => {
        if (!value) return 'Start date is required';
        const day = getDay(value);
        if (day !== 1) { // 1 = Monday
          return 'First day of the week must be Monday';
        }
        return true;
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
          return startOfWeek(new Date(), { weekStartsOn: 1 }); // 1 = Monday
        }

        const nextWeekDate = addWeeks(parseISO(lastServiceWeek.start), 1);
        return startOfWeek(nextWeekDate, { weekStartsOn: 1 }); // 1 = Monday
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
            return endOfWeek(start, { weekStartsOn: 1 }); // 1 = Monday
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