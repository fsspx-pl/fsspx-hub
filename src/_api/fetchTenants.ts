import { getCachedPayload } from '@/cached-local-api';
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

export const fetchTenant = async (id: string) => {
  const payload = await getPayloadHMR({
    config: configPromise,
  })

  const cachedPayload = getCachedPayload(payload)

  try {
    const result = await cachedPayload.findOne({
      collection: 'tenants',
      value: id
    })
    return result.docs
  } catch(err) {
    return Promise.reject(err)
  }
}