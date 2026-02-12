import { Event } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export interface FetchEventsParams {
  tenantId?: string
  domain?: string
  startDate?: string
  endDate?: string
  limit?: number
}

export const fetchEvents = async (params: FetchEventsParams = {}): Promise<Event[]> => {
  const payload = await getPayload({
    config: configPromise,
  })

  try {
    const conditions: Record<string, any>[] = []

    if (params.tenantId) {
      conditions.push({
        tenant: {
          equals: params.tenantId,
        },
      })
    }

    if (params.domain) {
      conditions.push({
        ['tenant.domain']: {
          contains: params.domain,
        },
      })
    }

    if (params.startDate || params.endDate) {
      if (params.startDate && params.endDate) {
        conditions.push({
          or: [
            {
              startDate: {
                greater_than_equal: params.startDate,
                less_than_equal: params.endDate,
              },
            },
            {
              endDate: {
                greater_than_equal: params.startDate,
                less_than_equal: params.endDate,
              },
            },
            {
              and: [
                {
                  startDate: {
                    less_than_equal: params.startDate,
                  },
                },
                {
                  endDate: {
                    greater_than_equal: params.endDate,
                  },
                },
              ],
            },
          ],
        })
      } else if (params.startDate) {
        conditions.push({
          or: [
            {
              startDate: {
                greater_than_equal: params.startDate,
              },
            },
            {
              endDate: {
                greater_than_equal: params.startDate,
              },
            },
          ],
        })
      } else if (params.endDate) {
        conditions.push({
          or: [
            {
              startDate: {
                less_than_equal: params.endDate,
              },
            },
            {
              endDate: {
                less_than_equal: params.endDate,
              },
            },
          ],
        })
      }
    }

    const where = conditions.length > 0 ? { and: conditions } : undefined

    const result = await payload.find({
      collection: 'events',
      where,
      sort: '-startDate',
      depth: 2,
      limit: params.limit || 50,
    })

    return result.docs
  } catch (err) {
    return Promise.reject(err)
  }
}
