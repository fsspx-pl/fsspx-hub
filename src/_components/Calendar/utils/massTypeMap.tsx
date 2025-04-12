import { Service as ServiceType } from "@/payload-types";
import { format } from "date-fns";

export const massTypeMap: Record<NonNullable<ServiceType['massType']>, string> = {
  sung: 'Msza Św. śpiewana',
  read: 'Msza Św. czytana',
  silent: 'Msza Św. cicha',
  solemn: 'Msza Św. solenna'
} as const;
