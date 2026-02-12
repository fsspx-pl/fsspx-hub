import { Page } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export interface FetchPagesParams {
  tenantId?: string
  domain?: string
  startDate?: string
  endDate?: string
  type?: string
  limit?: number
  published?: boolean
}

export const fetchPages = async (params: FetchPagesParams = {}): Promise<Page[]> => {
  const payload = await getPayload({
    config: configPromise,
  })

  try {
    const conditions: Record<string, any>[] = []

    if (params.published !== false) {
      conditions.push({
        _status: {
          equals: 'published',
        },
      })
    }

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

    if (params.type) {
      conditions.push({
        type: {
          equals: params.type,
        },
      })
    }

    if (params.startDate || params.endDate) {
      if (params.startDate && params.endDate) {
        conditions.push({
          or: [
            {
              ['period.start']: {
                greater_than_equal: params.startDate,
                less_than_equal: params.endDate,
              },
            },
            {
              ['period.end']: {
                greater_than_equal: params.startDate,
                less_than_equal: params.endDate,
              },
            },
            {
              and: [
                {
                  ['period.start']: {
                    less_than_equal: params.startDate,
                  },
                },
                {
                  ['period.end']: {
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
              ['period.start']: {
                greater_than_equal: params.startDate,
              },
            },
            {
              ['period.end']: {
                greater_than_equal: params.startDate,
              },
            },
          ],
        })
      } else if (params.endDate) {
        conditions.push({
          or: [
            {
              ['period.start']: {
                less_than_equal: params.endDate,
              },
            },
            {
              ['period.end']: {
                less_than_equal: params.endDate,
              },
            },
          ],
        })
      }
    }

    const where = conditions.length > 0 ? { and: conditions } : undefined

    const result = await payload.find({
      collection: 'pages',
      where,
      sort: '-period.start',
      depth: 2,
      limit: params.limit || 50,
    })

    return result.docs
  } catch (err) {
    return Promise.reject(err)
  }
}
