import { getFeasts } from "@/common/getFeasts";
import { getServices } from "@/common/getMasses";
import { Feast } from "@/feast";
import { Page as PageType, Service, Tenant } from "@/payload-types";
import { isSameDay, parseISO, startOfMonth, endOfMonth, subMonths, addMonths, startOfYear, endOfYear } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { POLISH_TIMEZONE } from "@/common/timezone";

export type FeastWithMasses = Feast & {
  masses: Service[];
};

type ServicesDateRange = {
  servicesStart: string;
  servicesEnd: string;
};

const toPolishTime = (date: Date | string): Date => {
  const dateStr = typeof date === 'string' ? date : date.toISOString();
  const polishDate = formatInTimeZone(dateStr, POLISH_TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
  return new Date(polishDate);
};

/**
 * Matches feasts with their corresponding masses based on date comparison in Polish timezone.
 * Optimized to pre-convert mass dates once to avoid repeated timezone conversions.
 */
const matchFeastsWithMasses = (feasts: Feast[], masses: Service[]): FeastWithMasses[] => {
  const massesWithPolishDates = masses.map(mass => ({
    mass,
    polishDate: toPolishTime(mass.date),
  }));

  return feasts.map((feast: Feast) => {
    const feastPolishDate = toPolishTime(feast.date);
    
    const feastMasses = massesWithPolishDates
      .filter(({ polishDate: massDate }) => isSameDay(massDate, feastPolishDate))
      .map(({ mass }) => mass);
    
    return {
      ...feast,
      masses: feastMasses,
    };
  });
};

export async function getFeastsWithMasses(
  period: PageType['period'] | undefined, 
  tenant: Tenant,
  referenceDate?: Date,
  servicesDateRange?: ServicesDateRange
) {
  let feastsStart: Date;
  let feastsEnd: Date;
  let massesStart: Date;
  let massesEnd: Date;

  if (period?.start && period?.end) {
    feastsStart = parseISO(period.start as string);
    feastsEnd = parseISO(period.end as string);
    massesStart = feastsStart;
    massesEnd = feastsEnd;
  } else {
    const currentDate = referenceDate || (period?.start ? parseISO(period.start as string) : new Date());
    
    feastsStart = startOfYear(currentDate);
    feastsEnd = endOfYear(currentDate);
    
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
  }

  const feasts = await getFeasts(feastsStart, feastsEnd);
  const masses = tenant?.id 
    ? await getServices(tenant, massesStart, massesEnd) 
    : [];
  return matchFeastsWithMasses(feasts, masses);
}
