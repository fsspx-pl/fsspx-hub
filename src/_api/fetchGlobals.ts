import { Footer, Header, Settings } from '@/payload-types';
import configPromise from '@payload-config';
import { getPayload } from 'payload';

const FetchGlobalsFactory = <T>(slug: 'settings' | 'header' | 'footer') => async () => {
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