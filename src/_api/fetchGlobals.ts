import { Footer, Header, Settings } from '@/payload-types';
import configPromise from '@payload-config';
import { getPayloadHMR } from '@payloadcms/next/utilities';
import { getCachedPayload } from "@/cached-local-api";

const FetchGlobalsFactory = <T>(slug: 'settings' | 'header' | 'footer') => async () => {
  const payload = await getPayloadHMR({
    config: configPromise,
  })

  const cachedPayload = getCachedPayload(payload)

  try {
    const result = await cachedPayload.findGlobal({
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