import { anyone } from '@/access/anyone';
import { superAndTenantAdmins } from '@/access/superAndTenantAdmins';
import { Service, ServiceWeek } from '@/payload-types';
import { addWeeks, endOfWeek, getDay, getISOWeek, isSunday, parseISO, startOfWeek } from 'date-fns';
import { CollectionConfig } from 'payload';
import { createServicesFromTenantsFeastTemplates } from './hooks/createServicesFromTenantsFeastTemplates';
import { tenantOnlyAccess } from '@/access/byTenant';

// Type for the day object in ServiceWeek
interface ServiceWeekDay {
  services?: Array<{
    service: string | Service;
    id?: string | null;
  }> | null;
}

export const ServiceWeeks: CollectionConfig = {
  slug: 'serviceWeeks',
  labels: {
    singular: {
      pl: 'Tygodniowy Porządek Nabożeństw',
      en: 'Service Week Order'
    },
    plural: {
      pl: 'Tygodniowe Porządki Nabożeństw',
      en: 'Service Week Orders'
    }
  },
  access: {
    read: anyone,
    create: tenantOnlyAccess,
    update: tenantOnlyAccess,
    delete: tenantOnlyAccess,
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
      createServicesFromTenantsFeastTemplates()
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
          pl: 'Lokalizacja, do której przypisany jest Tygodniowy Porządek Nabożeństw',
          en: 'Tenant to which this service week order is assigned'
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
    }
  ],
}; 