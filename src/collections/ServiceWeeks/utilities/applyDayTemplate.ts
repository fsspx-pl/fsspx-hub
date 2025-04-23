import { Service, Tenant } from '@/payload-types';
import { Payload } from 'payload';
import { format, parseISO } from 'date-fns';

/**
 * Apply a day template to create services for a specific date
 * 
 * @param payload Payload instance
 * @param date The date for which to create services
 * @param templateId The ID of the day template to apply
 * @param tenantId The ID of the tenant
 * @returns Array of created service IDs
 */
export const applyDayTemplate = async (
  payload: Payload,
  date: Date | string,
  templateId: string,
  tenantId: string,
): Promise<string[]> => {
  // Convert date to Date object if it's a string
  const serviceDate = typeof date === 'string' ? parseISO(date) : date;
  
  // Fetch the day template
  const template = await payload.findByID({
    collection: 'dayTemplates',
    id: templateId,
  }) as DayTemplate;
  
  if (!template) {
    throw new Error(`Day template with ID ${templateId} not found`);
  }
  
  // Create services for each service in the template
  const serviceIds: string[] = [];
  
  for (const templateService of template.services || []) {
    // Parse the time from the template (format: HH:MM)
    const [hours, minutes] = templateService.time.split(':').map(Number);
    
    // Create a new date with the time from the template
    const serviceDateTime = new Date(serviceDate);
    serviceDateTime.setHours(hours, minutes, 0, 0);
    
    // Create the service
    const serviceData: Partial<Service> = {
      time: serviceDateTime.toISOString(),
      tenant: tenantId,
      category: templateService.category,
    };
    
    // Add optional fields if they exist
    if (templateService.category === 'mass' && templateService.massType) {
      serviceData.massType = templateService.massType;
    }
    
    if (templateService.category === 'other' && templateService.customTitle) {
      serviceData.customTitle = templateService.customTitle;
    }
    
    if (templateService.notes) {
      serviceData.notes = templateService.notes;
    }
    
    // Create the service
    try {
      const createdService = await payload.create({
        collection: 'services',
        data: serviceData,
      }) as Service;
      
      serviceIds.push(createdService.id);
    } catch (error) {
      console.error('Error creating service:', error);
    }
  }
  
  return serviceIds;
};