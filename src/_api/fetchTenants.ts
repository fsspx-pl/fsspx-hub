import configPromise from '@payload-config';
import { getPayloadHMR } from '@payloadcms/next/utilities';

export const fetchTenants = async () => {
  const payload = await getPayloadHMR({
    config: configPromise,
  })

  try {
    const result = await payload.find({
      collection: 'tenants',
    })
    return result.docs
  } catch(err) {
    return Promise.reject(err)
  }
}