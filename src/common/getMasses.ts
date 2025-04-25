import { Service } from '@/payload-types';
import configPromise from '@payload-config';
import { getPayload } from 'payload';

export const getServices = async (tenant: string, start: Date, end: Date) => {
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
            equals: tenant
          },
          time: {
            greater_than_equal: start.toISOString(),
            less_than_equal: end.toISOString()
          }
        },
        sort: 'time',
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
}