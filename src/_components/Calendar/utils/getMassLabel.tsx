import { Service as ServiceType } from "@/payload-types";
import { format } from "date-fns";

export const massTypeMap = {
  ['sung' as ServiceType['type']]: 'Msza Św. śpiewana',
  ['read' as ServiceType['type']]: 'Msza Św. czytana',
  ['silent' as ServiceType['type']]: 'Msza Św. cicha',
}

export const getMassLabel = (type: ServiceType['type'], time: string): string => {
  return format(new Date(time), 'HH:mm') + ' - ' + (massTypeMap[type] ?? '')
};
