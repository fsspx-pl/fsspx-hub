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
              // Start date is within the month
              ['period.start']: {
                greater_than_equal: startDate.toISOString(),
                less_than_equal: endDate.toISOString(),
              }
            },
            {
              // End date is within the month
              ['period.end']: {
                greater_than_equal: startDate.toISOString(),
                less_than_equal: endDate.toISOString(),
              }
            },
            {
              // Spans across the month (starts before and ends after)
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
        sort: '-createdAt',
        depth: 2,
        limit: 50, // Reasonable limit for a month
      });
      
      return result.docs;
    } catch (err: unknown) {
      return Promise.reject(err);
    }
  })();
};