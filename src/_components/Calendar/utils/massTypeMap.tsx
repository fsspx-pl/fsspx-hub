import { Service as ServiceType } from "@/payload-types";

export const massTypeMap: Record<NonNullable<ServiceType['massType']>, string> = {
  sung: 'Msza św. śpiewana',
  read: 'Msza św. czytana',
  silent: 'Msza św. cicha',
  solemn: 'Msza św. solenna'
} as const;
