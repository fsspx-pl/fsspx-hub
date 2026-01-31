import { withPayload } from "@payloadcms/next/withPayload";
import { withPostHogConfig } from "@posthog/nextjs-config";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Packages with Cloudflare Workers (workerd) specific code
  // Read more: https://opennext.js.org/cloudflare/howtos/workerd
  serverExternalPackages: ['jose', 'pg-cloudflare'],
  output: "standalone",
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
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

    return headers;
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
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
    config.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    };

    config.module.rules.push({
      test: /\.svg$/,
      // Match both Unix (/) and Windows (\) path separators
      exclude: /app[/\\]icon\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
  allowedDevOrigins: ['poznan.localhost', 'warszawa.localhost'],
  // Enable compression
  compress: true,
};

export default withPostHogConfig(
  withPayload(nextConfig, { devBundleServerPackages: false }),
  {
    personalApiKey: process.env.POSTHOG_ERROR_TRACKING_APIKEY,
    envId: process.env.POSTHOG_ENV_ID,
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
    sourcemaps: {
      enabled: process.env.POSTHOG_UPLOAD_SOURCEMAPS === 'true',
      project: "fsspx-hub",
      deleteAfterUpload: true,
    },
  }
);
