import { Feast } from "@/feast";
import { isWithinInterval, parseISO } from "date-fns";

export const toVestmentColor = (color: string): string => {
  const colorMap: Record<string, string> = {
    w: "biały",
    r: "czerwony",
    v: "fioletowy",
    g: "zielony",
    b: "czarny",
  };
  return colorMap[color] || color;
};

export const getFeasts = async (start: Date, end: Date): Promise<Feast[]> => {
  const year = start.getFullYear();
  const res = await fetch(
    `https://www.missalemeum.com/pl/api/v5/calendar/${year}?v=v5.8.0`, {
      cache: 'force-cache'
    }
  );
  const feasts: Feast[] = await res.json();
  return feasts
    .filter(feast => {
      const feastDate = parseISO(feast.id);
      return isWithinInterval(feastDate, { start, end })
    })
    .map(feast => ({
      ...feast,
      colors: feast.colors.map(toVestmentColor),
      date: parseISO(feast.id),
    }));
};
