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

interface FetchPageOptions {
  includeDrafts?: boolean;
}

export const fetchTenantPageByDate = (
  subdomain: string, 
  isoDate: string,
  options: FetchPageOptions = {}
): Promise<Page | undefined> => {
  const { includeDrafts = false } = options;
  const date = format(isoDate, 'dd-MM-yyyy')
  const cacheKey = `page-${subdomain}-${date}${includeDrafts ? '-all' : ''}`;
  return unstable_cache(
    async (): Promise<Page | undefined> => {
      return findPage({
        ['tenant.domain']: {
          contains: subdomain
        },
        ['period.start']: {
          equals: isoDate,
        },
        ...(includeDrafts ? {} : published),
      });
    },
    [cacheKey],
    {
      revalidate: 60 * 60 * 24, // 24 hours
      tags: [`tenant:${subdomain}:date:${date}`],
    }
  )();
};

export const fetchPageById = (
  pageId: string,
  options: FetchPageOptions = {}
): Promise<Page | undefined> => {
  const { includeDrafts = false } = options;
  const cacheKey = `page-${pageId}${includeDrafts ? '-all' : ''}`;
  return unstable_cache(
    async (): Promise<Page | undefined> => {
      const payload = await getPayload({
        config: configPromise,
      });

      try {
        const page = await payload.findByID({
          collection: 'pages',
          id: pageId,
          depth: 2,
        });

        // Filter by published status if not including drafts
        if (!includeDrafts && page._status !== 'published') {
          return undefined;
        }

        return page;
      } catch (err: unknown) {
        return undefined;
      }
    },
    [cacheKey],
    {
      revalidate: 60 * 60 * 24, // 24 hours
      tags: [`page:${pageId}`],
    }
  )();
};

