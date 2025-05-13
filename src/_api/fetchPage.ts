import { Page } from "@/payload-types";
import configPromise from '@payload-config';
import { format } from "date-fns";
import { unstable_cache } from 'next/cache';
import { getPayload } from 'payload';

export const fetchLatestPage = (domain: string): Promise<Page | undefined> => {
  const cacheKey = `latest-page-${domain}`;
  return unstable_cache(
    async (): Promise<Page | undefined> => {
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
          },
          sort: '-createdAt',
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
      revalidate: 60 * 60 * 24, // 24 hours,
      tags: [`tenant:${domain}:latest`],
    }
  )();
};

export const fetchTenantPageByDate = (domain: string, isoDate: string): Promise<Page | undefined> => {
  const date = format(isoDate, 'dd-MM-yyyy')
  const cacheKey = `page-${domain}-${date}`;
  return unstable_cache(
    async (): Promise<Page | undefined> => {
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
            ['period.start']: {
              equals: isoDate,
            }
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
      revalidate: 60 * 60 * 24, // 24 hours
      tags: [`tenant:${domain}:date:${date}`],
    }
  )();
};

