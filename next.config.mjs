import { withPayload } from "@payloadcms/next/withPayload";
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async headers() {
    const headers = [];

    if (!process.env.NEXT_PUBLIC_IS_LIVE) {
      headers.push({
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex",
          },
        ],
        source: "/:path*",
      });
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
      },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      exclude: /app\/icon\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
  allowedDevOrigins: ['poznan.localhost'],
};

export default withPayload(nextConfig);
