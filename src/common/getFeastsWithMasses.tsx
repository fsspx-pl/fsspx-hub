import { getFeasts } from "@/common/getFeasts";
import { getServices } from "@/common/getMasses";
import { Feast } from "@/feast";
import { Announcement as AnnouncementType, Service, Tenant } from "@/payload-types";
import { parseISO, startOfMonth, endOfMonth, subMonths, addMonths, startOfYear, endOfYear } from "date-fns";
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
 * Extracts the date portion (yyyy-MM-dd) in Polish timezone.
 * This ensures midnight (00:00) in Polish time is matched to the correct day,
 * regardless of the server's timezone.
 */
const toPolishDateString = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatInTimeZone(dateObj, POLISH_TIMEZONE, 'yyyy-MM-dd');
};

/**
 * Matches feasts with their corresponding masses based on date comparison in Polish timezone.
 * Uses date strings (yyyy-MM-dd) to compare dates, ensuring midnight services
 * are correctly placed at the start of the day, not the end of the previous day.
 */
const matchFeastsWithMasses = (feasts: Feast[], masses: Service[]): FeastWithMasses[] => {
  const massesWithPolishDateStrings = masses.map(mass => ({
    mass,
    polishDateString: toPolishDateString(mass.date),
  }));

  return feasts.map((feast: Feast) => {
    const feastPolishDateString = toPolishDateString(feast.date);
    
    const feastMasses = massesWithPolishDateStrings
      .filter(({ polishDateString }) => polishDateString === feastPolishDateString)
      .map(({ mass }) => mass);
    
    return {
      ...feast,
      masses: feastMasses,
    };
  });
};

export async function getFeastsWithMasses(
  period: AnnouncementType['period'] | undefined, 
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
