import { getFeasts } from "@/common/getFeasts";
import { getServices } from "@/common/getMasses";
import { Feast } from "@/feast";
import { Page as PageType, Service, Tenant } from "@/payload-types";
import { addDays, isSameDay, parseISO } from "date-fns";

export type FeastWithMasses = Feast & {
  masses: Service[];
};

export async function getFeastsWithMasses(period: PageType['period'], tenant: Tenant) {
  const start = period?.start ? parseISO(period.start as string) : new Date();
  const end = period?.end ? parseISO(period.end as string) : addDays(start, 7);
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
