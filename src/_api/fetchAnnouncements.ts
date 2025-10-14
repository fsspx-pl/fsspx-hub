import { Page } from "@/payload-types";
import configPromise from '@payload-config';
import { startOfMonth, endOfMonth } from "date-fns";
import { getPayload } from 'payload';

export const fetchAnnouncementsByMonth = (domain: string, year: number, month: number): Promise<Page[]> => {
  const startDate = startOfMonth(new Date(year, month - 1, 1));
  const endDate = endOfMonth(new Date(year, month - 1, 1));
  
  return (async (): Promise<Page[]> => {
    const payload = await getPayload({
      config: configPromise,
    });

          try {
        const result = await payload.find({
          collection: 'pages',
          where: {
            ['tenant.domain']: {
              contains: domain
            },
            _status: {
              equals: 'published'
            },
            or: [
              {
                ['period.start']: {
                  greater_than_equal: startDate.toISOString(),
                  less_than_equal: endDate.toISOString(),
                }
              },
              {
                ['period.end']: {
                  greater_than_equal: startDate.toISOString(),
                  less_than_equal: endDate.toISOString(),
                }
              },
              {
                and: [
                  {
                    ['period.start']: {
                      less_than_equal: startDate.toISOString(),
                    }
                  },
                  {
                    ['period.end']: {
                      greater_than_equal: endDate.toISOString(),
                    }
                  }
                ]
              }
            ]
          },
          sort: '-period.start',
          depth: 2,
          limit: 50,
        });
      
      return result.docs;
    } catch (err: unknown) {
      return Promise.reject(err);
    }
  })();
};