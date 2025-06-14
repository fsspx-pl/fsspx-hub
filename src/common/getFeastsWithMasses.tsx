import { getFeasts } from "@/common/getFeasts";
import { getServices } from "@/common/getMasses";
import { Feast } from "@/feast";
import { Page as PageType, Service, Tenant } from "@/payload-types";
import { addDays, isSameDay, parseISO, startOfMonth, endOfMonth, subMonths, addMonths, startOfYear, endOfYear } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { POLISH_TIMEZONE } from "@/common/timezone";

export type FeastWithMasses = Feast & {
  masses: Service[];
};

/**
 * Converts a date to Polish timezone for comparison
 */
const toPolishTime = (date: Date | string): Date => {
  const dateStr = typeof date === 'string' ? date : date.toISOString();
  const polishDate = formatInTimeZone(dateStr, POLISH_TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
  return new Date(polishDate);
};

export async function getFeastsWithMasses(
  period: PageType['period'] | undefined, 
  tenant: Tenant,
  referenceDate?: Date
) {
  // Case 1: Period is defined (for emails) - filter feasts to the specified period
  if (period?.start && period?.end) {
    const startDate = parseISO(period.start as string);
    const endDate = parseISO(period.end as string);
    
    // Get feasts only for the specified period
    const feasts = await getFeasts(startDate, endDate);
    
    // Get masses for the period, with some buffer for context
    const currentMonth = startOfMonth(startDate);
    const prevMonth = subMonths(currentMonth, 1);
    const nextMonth = addMonths(endOfMonth(endDate), 1);
    const massesStart = startOfMonth(prevMonth);
    const massesEnd = endOfMonth(nextMonth);
    
    const masses = tenant?.id ? await getServices(
      tenant,
      massesStart,
      massesEnd
    ) : [];

    return feasts.map((feast: Feast) => {
      const feastMasses = masses.filter((mass) => {
        const massDate = toPolishTime(mass.date);
        const feastDate = toPolishTime(feast.date);
        return isSameDay(massDate, feastDate);
      });
      return {
        ...feast,
        masses: feastMasses,
      };
    });
  }
  
  // Case 2: Period is not defined (for calendar/announcement page) - get whole year feasts, limited masses
  const currentDate = referenceDate || (period?.start ? parseISO(period.start as string) : new Date());
  
  // Get feasts for the whole year (for calendar navigation)
  const yearStart = startOfYear(currentDate);
  const yearEnd = endOfYear(currentDate);
  const feasts = await getFeasts(yearStart, yearEnd);
  
  // Get masses only for prev/current/next month (for initial load)
  const currentMonth = startOfMonth(currentDate);
  const prevMonth = subMonths(currentMonth, 1);
  const nextMonth = addMonths(currentMonth, 1);
  const massesStart = startOfMonth(prevMonth);
  const massesEnd = endOfMonth(nextMonth);
  
  const masses = tenant?.id ? await getServices(
    tenant,
    massesStart,
    massesEnd
  ) : [];

  return feasts.map((feast: Feast) => {
    const feastMasses = masses.filter((mass) => {
      const massDate = toPolishTime(mass.date);
      const feastDate = toPolishTime(feast.date);
      return isSameDay(massDate, feastDate);
    });
    return {
      ...feast,
      masses: feastMasses,
    };
  });
}
