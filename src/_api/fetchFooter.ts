import configPromise from '@payload-config';
import { getPayloadHMR } from '@payloadcms/next/utilities';

export const fetchFooter = async () => {
  const payload = await getPayloadHMR({
    config: configPromise,
  })

  try {
    const result = await payload.findGlobal({
      slug: 'footer'
    })
    return result
  } catch(err) {
    return Promise.reject(err)
  }
}