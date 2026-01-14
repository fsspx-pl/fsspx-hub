import { Announcement } from '@/payload-types'
import configPromise from '@payload-config'
import { format } from 'date-fns'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

const isBuildPhase =
  process.env.NEXT_PHASE === 'phase-production-build' || process.env.npm_lifecycle_event === 'build'

const hasPayloadEnv = Boolean(process.env.PAYLOAD_SECRET && process.env.DATABASE_URI)

const published = {
  _status: {
    equals: 'published',
  },
}

async function findAnnouncement(
  where: Record<string, any>,
  sort?: string,
): Promise<Announcement | undefined> {
  if (!hasPayloadEnv) {
    if (isBuildPhase) return undefined
    throw new Error('Missing required env: PAYLOAD_SECRET and/or DATABASE_URI')
  }

  const payload = await getPayload({
    config: configPromise,
  })

  try {
    const result = await payload.find({
      collection: 'announcements',
      where,
      ...(sort && { sort }),
      depth: 2,
      limit: 1,
    })
    const [doc] = result.docs
    return doc
  } catch (err: unknown) {
    return Promise.reject(err)
  }
}

export const fetchLatestAnnouncement = (subdomain: string): Promise<Announcement | undefined> => {
  const cacheKey = `latest-announcement-${subdomain}`
  return unstable_cache(
    async (): Promise<Announcement | undefined> => {
      return findAnnouncement(
        {
          ['tenant.domain']: {
            contains: subdomain,
          },
          ...published,
        },
        '-createdAt',
      )
    },
    [cacheKey],
    {
      revalidate: 60 * 60 * 24, // 24 hours
      tags: [`tenant:${subdomain}:latest`],
    },
  )()
}

interface FetchAnnouncementOptions {
  includeDrafts?: boolean
}

export const fetchTenantAnnouncementByDate = (
  subdomain: string,
  isoDate: string,
  options: FetchAnnouncementOptions = {},
): Promise<Announcement | undefined> => {
  const { includeDrafts = false } = options
  const date = format(isoDate, 'dd-MM-yyyy')
  const cacheKey = `announcement-${subdomain}-${date}${includeDrafts ? '-all' : ''}`
  return unstable_cache(
    async (): Promise<Announcement | undefined> => {
      return findAnnouncement({
        ['tenant.domain']: {
          contains: subdomain,
        },
        ['period.start']: {
          equals: isoDate,
        },
        ...(includeDrafts ? {} : published),
      })
    },
    [cacheKey],
    {
      revalidate: 60 * 60 * 24, // 24 hours
      tags: [`tenant:${subdomain}:date:${date}`],
    },
  )()
}

export const fetchAnnouncementById = (announcementId: string): Promise<Announcement | undefined> => {
  const cacheKey = `announcement-${announcementId}`
  return unstable_cache(
    async (): Promise<Announcement | undefined> => {
      return findAnnouncement({
        id: announcementId,
      })
    },
    [cacheKey],
    {
      revalidate: 60 * 60 * 24, // 24 hours
      tags: [`announcement:${announcementId}`],
    },
  )()
}

