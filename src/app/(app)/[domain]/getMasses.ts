import configPromise from '@payload-config';
import { getPayloadHMR } from '@payloadcms/next/utilities';

export const getServices = async (tenant: string, start: string, end: string) => {
  const payload = await getPayloadHMR({
    config: configPromise,
  })

  try {
    const result = await payload.find({
      collection: 'services',
      where: {
        tenant: {
          equals: tenant
        },
        time: {
          greater_than_equal: start,
          less_than_equal: end
        }
      },
      sort: 'time' 
    })
    return result.docs
  } catch(err) {
    return Promise.reject(err)
  }
}