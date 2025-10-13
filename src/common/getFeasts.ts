import { ApiFeast, Feast, VestmentColor } from "@/feast";
import { isWithinInterval, parse } from "date-fns";
import { unstable_cache } from "next/cache";

export const mapToVestmentColor = (color: string): VestmentColor => {
  const colorMap: Record<string, VestmentColor> = {
    w: VestmentColor.WHITE,
    r: VestmentColor.RED,
    v: VestmentColor.VIOLET,
    g: VestmentColor.GREEN,
    b: VestmentColor.BLACK,
  };
  return colorMap[color];
};

const REFERENCE_DATE = new Date(2000, 0, 1);

/**
 * Fetches liturgical calendar data for a given year from the external API.
 * This data is cached since liturgical calendars rarely change.
 */
const fetchCalendar = async (year: number): Promise<ApiFeast[]> => {
  const cacheKey = `liturgical-calendar-${year}`;
  const CACHE_TTL = 60 * 60 * 24 * 90; // 90 days
  
  return unstable_cache(
    async () => {
      const res = await fetch(
        `https://www.missalemeum.com/pl/api/v5/calendar/${year}?v=v5.8.0`,
        {
          cache: 'force-cache',
          next: {
            revalidate: CACHE_TTL
          }
        }
      );
      
      if (!res.ok) {
        throw new Error(`Failed to fetch liturgical calendar for ${year}: ${res.statusText}`);
      }
      
      return res.json();
    },
    [cacheKey],
    {
      revalidate: CACHE_TTL,
      tags: [`liturgical-calendar:${year}`],
    }
  )();
};

export const getFeasts = async (start: Date, end: Date): Promise<Feast[]> => {
  const year = start.getFullYear();
  const endYear = end.getFullYear();
  
  // If date range spans multiple years, fetch both years
  const years = year === endYear ? [year] : [year, endYear];
  const allFeasts = await Promise.all(
    years.map(y => fetchCalendar(y))
  );
  const feasts = allFeasts.flat();
  
  const result: Feast[] = [];
  
  for (const feast of feasts) {
    const feastDate = parse(feast.id, 'yyyy-MM-dd', REFERENCE_DATE);
    
    if (isWithinInterval(feastDate, { start, end })) {
      result.push({
        ...feast,
        color: mapToVestmentColor(feast.colors[0]),
        date: feastDate,
      });
    }
  }
  
  return result;
};

/**
 * Pre-warms the liturgical calendar cache for the current and next year.
 * Call this during build time to ensure the cache is populated.
 */
export const prewarmCalendarCache = async (): Promise<void> => {
  const currentYear = new Date().getFullYear();
  await Promise.all([
    fetchCalendar(currentYear),
    fetchCalendar(currentYear + 1),
  ]);
};
