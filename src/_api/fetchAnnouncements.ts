import { Announcement } from "@/payload-types";
import configPromise from '@payload-config';
import { startOfMonth, endOfMonth } from "date-fns";
import { getPayload } from 'payload';

const isBuildPhase =
  process.env.NEXT_PHASE === 'phase-production-build' || process.env.npm_lifecycle_event === 'build'

const isTestEnv = process.env.NODE_ENV === 'test'

const hasPayloadEnv = Boolean(process.env.PAYLOAD_SECRET && process.env.DATABASE_URI)

export const fetchAnnouncementsByMonth = (domain: string, year: number, month: number): Promise<Announcement[]> => {
  const startDate = startOfMonth(new Date(year, month - 1, 1));
  const endDate = endOfMonth(new Date(year, month - 1, 1));
  
  return (async (): Promise<Announcement[]> => {
    if (!hasPayloadEnv && !isTestEnv) {
      if (isBuildPhase) return []
      throw new Error('Missing required env: PAYLOAD_SECRET and/or DATABASE_URI')
    }

    const payload = await getPayload({
      config: configPromise,
    });

          try {
        const result = await payload.find({
          collection: 'announcements',
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