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

/**
 * Creates a date with Polish timezone context for proper storage
 * @param year - Year
 * @param month - Month (0-11)
 * @param day - Day of month
 * @param hour - Hour (0-23)
 * @param minute - Minute (0-59)
 * @returns UTC Date object that represents the Polish local time
 */
export const createPolishDate = (
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0
): Date => {
  const localDate = new Date(year, month, day, hour, minute);
  return polishTimeToUtc(localDate);
}; 