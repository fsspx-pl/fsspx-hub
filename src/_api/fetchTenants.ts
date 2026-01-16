import configPromise from '@payload-config';
import { getPayload } from 'payload';

const isBuildPhase =
  process.env.NEXT_PHASE === 'phase-production-build' || process.env.npm_lifecycle_event === 'build'

const isTestEnv = process.env.NODE_ENV === 'test'

const hasPayloadEnv = Boolean(process.env.PAYLOAD_SECRET && process.env.DATABASE_URI)

function assertPayloadEnv(): void {
  if (hasPayloadEnv) return
  if (isBuildPhase) return
  if (isTestEnv) return
  throw new Error('Missing required env: PAYLOAD_SECRET and/or DATABASE_URI')
}

export const fetchTenants = async () => {
  assertPayloadEnv()
  if (!hasPayloadEnv && isBuildPhase) return []

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
  assertPayloadEnv()
  if (!hasPayloadEnv && isBuildPhase) return null

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
    return result.docs[0] ?? null
  } catch(err) {
    return Promise.reject(err)
  }
}

export const fetchTenantById = async (id: string) => {
  assertPayloadEnv()
  if (!hasPayloadEnv && isBuildPhase) return null

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