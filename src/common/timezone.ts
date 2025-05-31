import { fromZonedTime, toZonedTime, formatInTimeZone } from 'date-fns-tz';
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
 * Converts a UTC date to Polish local time for display
 * @param date - The UTC date
 * @returns Date object representing Polish local time
 */
export const utcToPolishTime = (date: Date): Date => {
  return toZonedTime(date, POLISH_TIMEZONE);
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