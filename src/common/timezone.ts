import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import { pl } from 'date-fns/locale';

/**
 * Polish timezone constant
 */
export const POLISH_TIMEZONE = 'Europe/Warsaw';

/**
 * Converts a date from Polish local time to UTC for storage
 * @param date - The date in Polish local time
 * @returns Date object in UTC
 */
export const polishTimeToUtc = (date: Date): Date => {
  return fromZonedTime(date, POLISH_TIMEZONE);
};

/**
 * Formats a date in Polish timezone with Polish locale
 * @param date - The date to format (can be UTC)
 * @param formatString - The format string
 * @returns Formatted date string in Polish timezone
 */
export const formatInPolishTime = (date: Date | string, formatString: string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatInTimeZone(dateObj, POLISH_TIMEZONE, formatString, { locale: pl });
};

/**
 * Creates a timezone-aware Date object from date components, interpreted as Polish local time.
 * @param year - Year
 * @param month - Month (1-12)
 * @param day - Day of month
 * @param hour - Hour (0-23)
 * @param minute - Minute (0-59)
 * @returns A Date object representing the specified time in UTC.
 */
export const createPolishDate = (
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0
): Date => {
  const monthStr = String(month).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  const hourStr = String(hour).padStart(2, '0');
  const minuteStr = String(minute).padStart(2, '0');
  
  const polishDateStr = `${year}-${monthStr}-${dayStr}T${hourStr}:${minuteStr}:00`;

  return fromZonedTime(polishDateStr, 'Europe/Warsaw');
};