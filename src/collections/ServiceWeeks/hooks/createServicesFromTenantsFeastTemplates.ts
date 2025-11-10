import { CollectionBeforeChangeHook, Payload } from "payload";
import { ServiceWeek, FeastTemplate } from "@/payload-types";
import { Tenant } from "@/payload-types";
import { getDay, parseISO } from "date-fns";
import { getFeasts } from "@/common/getFeasts";
import { Feast } from "@/feast";
import { createPolishDate, formatInPolishTime } from "@/common/timezone";
import selectTemplateForDate, { getDayTabName } from '@/common/templates/selectTemplateForDate'

// Define type for feast days grouped by day of week
interface FeastsByDay {
  [key: number]: Feast[];
}

/**
 * Finds the appropriate service template for a given feast.
 * @param feast - The feast to find a template for.
 * @param templates - The available feast templates from the tenant.
 * @returns The matching template or undefined.
 */
const findTemplateForFeast = (
  feast: Feast,
  templates: FeastTemplate[]
): FeastTemplate | undefined => {
  const date = new Date(formatInPolishTime(feast.date, 'yyyy-MM-dd'))
  return selectTemplateForDate(templates, date)
}

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
    const feastDate = new Date(formatInPolishTime(feast.date, 'yyyy-MM-dd'))
    const day = getDay(feastDate)
    const dayTab = getDayTabName(day)
    const dayData = template?.[dayTab]
    const services = Array.isArray(dayData?.services) ? dayData.services : []
    
    if (!services.length) return [];
  
    const servicePromises = services.map(async (templateService: any) => {
      if (!templateService) return null;
      
      const timeString = templateService.time as string;
      
      const polishTime = formatInPolishTime(new Date(timeString), 'HH:mm');
      const timeMatch = polishTime.match(/(\d{2}):(\d{2})/);
  
      if (!timeMatch) {
        payload.logger.error(`Invalid time format: ${timeString} for feast: ${feast.title}`);
        return null;
      }
  
      const hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
  
      // Get the date components from the feast date in Polish timezone
      const polishDateStr = formatInPolishTime(feast.date, 'yyyy-MM-dd');
      const [year, month, day] = polishDateStr.split('-').map(Number);
      
      // Use createPolishDate to properly handle timezone conversion
      const serviceDate = createPolishDate(year, month, day, hours, minutes);
  
      const serviceData = {
        tenant: tenantId,
        date: serviceDate.toISOString(),
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

export const createServicesFromTenantsFeastTemplates = (): CollectionBeforeChangeHook<ServiceWeek> => {
    return async ({ data, req, operation }) => {
        if (operation !== 'create') return data;
  
        const { start, end, tenant: tenantId } = data;
        if (!start || !end || !tenantId) return data;
  
        const startDate = typeof start === 'string' ? parseISO(start) : start;
        const endDate = typeof end === 'string' ? parseISO(end) : end;
  
        const tenant = await req.payload.findByID({
          collection: 'tenants',
          id: tenantId as string,
          depth: 2
        }) as Tenant;
  
        if (!tenant) return data;
  
        const feasts = await getFeasts(startDate, endDate);
        // Load all templates for tenant once
        const templatesRes = await req.payload.find({
          collection: 'feastTemplates',
          where: { tenant: { equals: tenant.id } },
          limit: 1000,
        })
        const allTemplates = templatesRes.docs as FeastTemplate[]
        const feastsByDay = feasts.reduce<FeastsByDay>((acc, feast) => {
          // Convert UTC date to Polish time before getting the day
          const polishDate = formatInPolishTime(feast.date, 'yyyy-MM-dd');
          const dayOfWeek = getDay(new Date(polishDate));
          if (!acc[dayOfWeek]) acc[dayOfWeek] = [];
          acc[dayOfWeek].push(feast);
          return acc;
        }, {});
  
        const updatedData: any = { ...data };
  
        // Process days starting from Monday (1) to Sunday (0)
        const dayOrder = [1, 2, 3, 4, 5, 6, 0]; // Monday to Sunday
        for (const dayNumber of dayOrder) {
          const dayFeasts = feastsByDay[dayNumber] || [];

          const servicePromises = dayFeasts.map((feast: Feast) => {
            const template = findTemplateForFeast(feast, allTemplates);
            if (!template) return Promise.resolve([]);
            return createServicesForFeast(feast, template, tenant.id, req.payload);
          });

          const servicesForDay = (await Promise.all(servicePromises)).flat();

          if (servicesForDay.length > 0) {
            const tabName = getDayTabName(dayNumber);
            // Respect existing services if prefilled
            if (updatedData[tabName]?.services?.length) continue
            updatedData[tabName] = {
              ...(updatedData[tabName] || {}),
              services: servicesForDay,
            };
          }
        }
  
        return updatedData;
      };
  };
  