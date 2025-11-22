import { Event } from "@/payload-types";
import configPromise from '@payload-config';
import { unstable_cache } from 'next/cache';
import { getPayload } from 'payload';

export const fetchEventBySlug = (domain: string, slug: string): Promise<Event | undefined> => {
  const cacheKey = `event-${domain}-${slug}`;
  return unstable_cache(
    async (): Promise<Event | undefined> => {
      const payload = await getPayload({
        config: configPromise,
      });

      try {
        const result = await payload.find({
          collection: 'events',
          where: {
            and: [
              {
                ['tenant.domain']: {
                  contains: domain
                }
              },
              {
                slug: {
                  equals: slug
                }
              }
            ]
          },
          depth: 2,
          limit: 1,
        });
        const [doc] = result.docs;
        return doc;
      } catch (err: unknown) {
        return Promise.reject(err);
      }
    },
    [cacheKey],
    {
      revalidate: 60 * 5, // 5 minutes
      tags: [`event:${domain}:${slug}`],
    }
  )();
};

