import { getPayloadHMR } from "@payloadcms/next/utilities";
import configPromise from '@payload-config';
import { Page } from "@/payload-types";
import { getCachedPayload } from "@/cached-local-api";

export const fetchLatestPage = async (domain: string): Promise<Page> => {
  const payload = await getPayloadHMR({
    config: configPromise,
  })

  const cachedPayload = getCachedPayload(payload)

  try {
    // const result = await cachedPayload.find({
    const result = await payload.find({
      collection: 'pages',
      where: {
        ['tenant.domain']: {
          contains: domain
        }
      },
      sort: '-createdAt',
      depth: 2,
      limit: 1
    })
    const [ doc ] = result.docs
    return doc
  } catch (err: unknown) {
    return Promise.reject(err);
  }
};
