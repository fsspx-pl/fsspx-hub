import { withPayload } from '@payloadcms/next/withPayload'
/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    async headers() {
        const headers = []
        
        if (!process.env.NEXT_PUBLIC_IS_LIVE) {
          headers.push({
            headers: [
              {
                key: 'X-Robots-Tag',
                value: 'noindex',
              },
            ],
            source: '/:path*',
          })
        }
      },
};

export default withPayload(nextConfig);
