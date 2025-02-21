import { ApiFeast, Feast, VestmentColor } from "@/feast";
import { isWithinInterval, parse } from "date-fns";

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

export const getFeasts = async (start: Date, end: Date): Promise<Feast[]> => {
  const now = new Date();
  const year = start.getFullYear();
  const res = await fetch(
    `https://www.missalemeum.com/pl/api/v5/calendar/${year}?v=v5.8.0`, {
      cache: 'force-cache'
    }
  );
  const feasts: ApiFeast[] = await res.json();
  return feasts
    .filter(feast => {
      const feastDate = parse(feast.id, 'yyyy-MM-dd', now);
      return isWithinInterval(feastDate, { start, end })
    })
    .map(feast => ({
      ...feast,
      color: mapToVestmentColor(feast.colors[0]),
      date: parse(feast.id, 'yyyy-MM-dd', now),
    }));
};
