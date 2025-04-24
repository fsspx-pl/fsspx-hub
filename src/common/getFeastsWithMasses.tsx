import { Feast } from "@/feast";
import { Service, Tenant } from "@/payload-types";
import { addDays, isSameDay, parseISO, startOfWeek } from "date-fns";
import { getFeasts } from "@/common/getFeasts";
import { getServices } from "@/common/getMasses";
import { Page as PageType } from "@/payload-types";

export type FeastWithMasses = Feast & {
  masses: Service[];
};

export async function getFeastsWithMasses(period: PageType['period'], tenant: Tenant) {
  const start = period?.start ? startOfWeek(parseISO(period.start as string), { weekStartsOn: 0 }) : new Date();
  const end = period?.end ? parseISO(period.end) : addDays(start, 7);
  const feasts = await getFeasts(start, end);
  const masses = tenant?.id ? await getServices(
    tenant?.id,
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
