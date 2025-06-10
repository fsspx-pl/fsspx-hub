import { getFeasts } from "@/common/getFeasts";
import { getServices } from "@/common/getMasses";
import { Feast } from "@/feast";
import { Page as PageType, Service, Tenant } from "@/payload-types";
import { addDays, isSameDay, parseISO, startOfMonth, endOfMonth, subMonths, addMonths, startOfYear, endOfYear } from "date-fns";

export type FeastWithMasses = Feast & {
  masses: Service[];
};

export async function getFeastsWithMasses(period: PageType['period'], tenant: Tenant) {
  const currentDate = period?.start ? parseISO(period.start as string) : new Date();
  
  const yearStart = startOfYear(currentDate);
  const yearEnd = endOfYear(currentDate);
  const feasts = await getFeasts(yearStart, yearEnd);
  
  const currentMonth = startOfMonth(currentDate);
  const prevMonth = subMonths(currentMonth, 1);
  const nextMonth = addMonths(currentMonth, 1);
  const start = startOfMonth(prevMonth);
  const end = endOfMonth(nextMonth);
  
  const masses = tenant?.id ? await getServices(
    tenant,
    start,
    end
  ) : [];

  return feasts.map((feast: Feast) => {
    const feastMasses = masses.filter((mass) => {
      const massDate = parseISO(mass.date);
      return isSameDay(massDate, feast.date);
    });
    return {
      ...feast,
      masses: feastMasses,
    };
  });
}
