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

type ServicesDateRange = {
  servicesStart: string;
  servicesEnd: string;
};

/**
 * Converts a date to Polish timezone
 */
const toPolishTime = (date: Date | string): Date => {
  const dateStr = typeof date === 'string' ? date : date.toISOString();
  const polishDate = formatInTimeZone(dateStr, POLISH_TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
  return new Date(polishDate);
};

export async function getFeastsWithMasses(
  period: PageType['period'] | undefined, 
  tenant: Tenant,
  referenceDate?: Date,
  servicesDateRange?: ServicesDateRange
) {
  if (period?.start && period?.end) {
    const startDate = parseISO(period.start as string);
    const endDate = parseISO(period.end as string);
    
    const feasts = await getFeasts(startDate, endDate);
    
    const masses = tenant?.id ? await getServices(
      tenant,
      startDate,
      endDate
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
  
  const currentDate = referenceDate || (period?.start ? parseISO(period.start as string) : new Date());
  
  const yearStart = startOfYear(currentDate);
  const yearEnd = endOfYear(currentDate);
  const feasts = await getFeasts(yearStart, yearEnd);
  
  let massesStart: Date;
  let massesEnd: Date;

  if (servicesDateRange) {
    massesStart = parseISO(servicesDateRange.servicesStart);
    massesEnd = parseISO(servicesDateRange.servicesEnd);
  } else {
    const currentMonth = startOfMonth(currentDate);
    const prevMonth = subMonths(currentMonth, 1);
    const nextMonth = addMonths(currentMonth, 1);
    massesStart = startOfMonth(prevMonth);
    massesEnd = endOfMonth(nextMonth);
  }
  
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
