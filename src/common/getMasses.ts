import configPromise from '@payload-config';
import { getPayload } from 'payload';

export const getServices = async (tenant: string, start: Date, end: Date) => {
  const payload = await getPayload({
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
          greater_than_equal: start.toISOString(),
          less_than_equal: end.toISOString()
        }
      },
      sort: 'time' 
    })
    return result.docs
  } catch(err) {
    return Promise.reject(err)
  }
}