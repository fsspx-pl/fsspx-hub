import { CollectionBeforeChangeHook } from "payload";
import { endOfDay, startOfDay } from "date-fns";
import { Page } from "@/payload-types";

export const normalizePeriodDates: CollectionBeforeChangeHook<Page> = async ({
  data,
}) => {
  // Fix period dates to start/end of day
  if (data?.period?.start) {
    return {
      ...data,
      period: {
        ...data.period,
        start: startOfDay(data.period.start),
        end: endOfDay(data.period.end),
      },
    };
  }
  return data;
};

