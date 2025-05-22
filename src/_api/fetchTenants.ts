import configPromise from '@payload-config';
import { getPayload } from 'payload';

export const fetchTenants = async () => {
  const payload = await getPayload({
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

export const fetchTenant = async (name: string) => {
  const payload = await getPayload({
    config: configPromise,
  })

  try {
    const result = await payload.find({
      collection: 'tenants',
      where: {
        domain: {
          equals: name
        }
      }
    })
    return result.docs[0]
  } catch(err) {
    return Promise.reject(err)
  }
}

export const fetchTenantById = async (id: string) => {
  const payload = await getPayload({
    config: configPromise,
  })

  try {
    const result = await payload.findByID({
      collection: 'tenants',
      id: id
    })
    return result
  } catch(err) {
    return Promise.reject(err)
  }
}