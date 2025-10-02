import { Service as ServiceType } from '@/payload-types'
import { massTypeMap } from './massTypeMap'

export const getServiceTitle = (service: ServiceType) => {
  if(service.category === 'lamentations') return `Gorzkie żale`;
  if(service.category === 'rosary') return `Różaniec`;
  if(service.category === 'mass' && service.massType) {
    return massTypeMap[service.massType];
  }
  return service.customTitle ?? '';
};
