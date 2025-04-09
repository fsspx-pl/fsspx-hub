import { Page } from "@/payload-types";
import configPromise from '@payload-config';
import { getPayload } from 'payload';

export const fetchLatestPage = async (domain: string): Promise<Page | undefined> => {
  const payload = await getPayload({
    config: configPromise,
  })

  try {
    const result = await payload.find({
      collection: 'pages',
      where: {
        ['tenant.domain']: {
          contains: domain
        }
      },
      sort: '-createdAt',
      depth: 2,
      limit: 1,
    })
    const [ doc ] = result.docs
    return doc
  } catch (err: unknown) {
    return Promise.reject(err);
  }
};
