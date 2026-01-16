import { Page } from "@/payload-types";
import configPromise from '@payload-config';
import { format } from "date-fns";
import { unstable_cache } from 'next/cache';
import { getPayload } from 'payload';

const published = {
  _status: {
    equals: 'published'
  },
}

async function findPage(
  where: Record<string, any>,
  sort?: string
): Promise<Page | undefined> {
  const payload = await getPayload({
    config: configPromise,
  });

  try {
    const result = await payload.find({
      collection: 'pages',
      where,
      ...(sort && { sort }),
      depth: 2,
      limit: 1,
    });
    const [doc] = result.docs;
    return doc;
  } catch (err: unknown) {
    return Promise.reject(err);
  }
}

export const fetchLatestPage = (subdomain: string): Promise<Page | undefined> => {
  const cacheKey = `latest-page-${subdomain}`;
  return unstable_cache(
    async (): Promise<Page | undefined> => {
      return findPage(
        {
          ['tenant.domain']: {
            contains: subdomain
          },
          ...published,
        },
        '-createdAt'
      );
    },
    [cacheKey],
    {
      revalidate: 60 * 60 * 24, // 24 hours,
      tags: [`tenant:${subdomain}:latest`],
    }
  )();
};

export const fetchTenantPageByDate = (subdomain: string, isoDate: string): Promise<Page | undefined> => {
  const date = format(isoDate, 'dd-MM-yyyy')
  const cacheKey = `page-${subdomain}-${date}`;
  return unstable_cache(
    async (): Promise<Page | undefined> => {
      return findPage({
        ['tenant.domain']: {
          contains: subdomain
        },
        ['period.start']: {
          equals: isoDate,
        },
        ...published,
      });
    },
    [cacheKey],
    {
      revalidate: 60 * 60 * 24, // 24 hours
      tags: [`tenant:${subdomain}:date:${date}`],
    }
  )();
};
