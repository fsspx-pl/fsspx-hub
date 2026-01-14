import { Event } from "@/payload-types";
import configPromise from '@payload-config';
import { unstable_cache } from 'next/cache';
import { getPayload } from 'payload';

const isBuildPhase =
  process.env.NEXT_PHASE === 'phase-production-build' || process.env.npm_lifecycle_event === 'build'

const hasPayloadEnv = Boolean(process.env.PAYLOAD_SECRET && process.env.DATABASE_URI)

export const fetchEventBySlug = (domain: string, slug: string): Promise<Event | undefined> => {
  const cacheKey = `event-${domain}-${slug}`;
  return unstable_cache(
    async (): Promise<Event | undefined> => {
      if (!hasPayloadEnv) {
        if (isBuildPhase) return undefined
        throw new Error('Missing required env: PAYLOAD_SECRET and/or DATABASE_URI')
      }

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

