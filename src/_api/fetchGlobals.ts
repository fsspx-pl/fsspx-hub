import { Footer, Settings } from '@/payload-types';
import configPromise from '@payload-config';
import { getPayloadHMR } from '@payloadcms/next/utilities';

const FetchGlobalsFactory = <T>(slug: 'settings' | 'footer') => async () => {
  const payload = await getPayloadHMR({
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

export const fetchFooter = FetchGlobalsFactory<Footer>('footer')
export const fetchSettings = FetchGlobalsFactory<Settings>('settings')