FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY pnpm-lock.yaml* package.json ./
COPY fonts.json ./
COPY scripts/download-fonts.cjs ./scripts/download-fonts.cjs
RUN SHA_SUM=$(npm view pnpm@10.1.0 dist.shasum) && corepack install -g pnpm@10.1.0+sha1.$SHA_SUM
RUN corepack enable pnpm
RUN pnpm i --frozen-lockfile
RUN pnpm rebuild sharp

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/fonts ./fonts
COPY . .

RUN SHA_SUM=$(npm view pnpm@10.1.0 dist.shasum) && corepack install -g pnpm@10.1.0+sha1.$SHA_SUM
RUN corepack enable pnpm && pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir .next media
RUN chown nextjs:nodejs .next media

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD HOSTNAME="0.0.0.0" node server.js
