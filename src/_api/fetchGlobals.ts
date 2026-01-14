import { Footer, Header, Settings } from '@/payload-types';
import configPromise from '@payload-config';
import { getPayload } from 'payload';

const isBuildPhase =
  process.env.NEXT_PHASE === 'phase-production-build' || process.env.npm_lifecycle_event === 'build'

const isTestEnv = process.env.NODE_ENV === 'test'

const hasPayloadEnv = Boolean(process.env.PAYLOAD_SECRET && process.env.DATABASE_URI)

const FetchGlobalsFactory = <T>(slug: 'settings' | 'header' | 'footer') => async () => {
  if (!hasPayloadEnv && !isTestEnv) {
    if (isBuildPhase) return null as unknown as T
    throw new Error('Missing required env: PAYLOAD_SECRET and/or DATABASE_URI')
  }

  const payload = await getPayload({
    config: configPromise,
  })

  try {
    const result = await payload.findGlobal({
      slug
    })
    return result as T
    
  } catch(err) {
    return Promise.reject(err)
  }
}

export const fetchSettings = FetchGlobalsFactory<Settings>('settings')
export const fetchHeader = FetchGlobalsFactory<Header>('header')
export const fetchFooter = FetchGlobalsFactory<Footer>('footer')