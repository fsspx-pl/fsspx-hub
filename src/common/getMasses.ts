import { Service, Tenant } from '@/payload-types';
import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { unstable_cache } from 'next/cache';
import { format } from 'date-fns';

export const getServices = async (tenant: string | Tenant, start: Date, end: Date) => {
  const tenantDomain = typeof tenant === 'string' ? tenant : tenant.general.domain;
  const cacheKey = `services-${tenantDomain}-${format(start, 'yyyy-MM-dd')}-${format(end, 'yyyy-MM-dd')}`;
  return unstable_cache(
    async () => {
      const payload = await getPayload({
        config: configPromise,
      })

      try {
        let allDocs: Service[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const result = await payload.find({
            collection: 'services',
            where: {
              tenant: {
                equals: typeof tenant === 'string' ? tenant : tenant.id
              },
              date: {
                greater_than_equal: start.toISOString(),
                less_than_equal: end.toISOString()
              }
            },
            sort: 'date',
            page,
            limit: 100
          });

          allDocs = [...allDocs, ...result.docs];
          hasMore = result.hasNextPage;
          page++;
        }

        return allDocs;
      } catch(err) {
        return Promise.reject(err);
      }
    },
    [cacheKey],
    {
      revalidate: 60 * 60 * 24, // 24 hours
      tags: [`tenant:${tenantDomain}:services`],
    }
  )();
}