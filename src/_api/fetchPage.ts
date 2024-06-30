import { getPayloadHMR } from "@payloadcms/next/utilities";
import configPromise from '@payload-config';
import { Page } from "@/payload-types";

export const fetchLatestPage = async (domain: string): Promise<Page> => {
  const payload = await getPayloadHMR({
    config: configPromise,
  })

  try {
    const result = await payload.find({
      collection: 'pages',
      where: {
        ['tenant.domains.domain']: {
          contains: domain
        }
      },
      sort: '-createdAt',
      limit: 1
    })
    const [ doc ] = result.docs
    return doc
  } catch (err: unknown) {
    return Promise.reject(err);
  }
};
