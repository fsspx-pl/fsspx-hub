import { fetchEvents } from '@/_api/fetchEvents'
import { verifyApiToken } from '@/utilities/verifyApiToken'
import { parseISO } from 'date-fns'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  if (!verifyApiToken(request)) {
    return NextResponse.json(
      { error: 'Unauthorized. Valid API token required.' },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenant')
    const domain = searchParams.get('domain')
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')
    const limitParam = searchParams.get('limit')

    const params: Parameters<typeof fetchEvents>[0] = {}

    if (tenantId) {
      params.tenantId = tenantId
    }

    if (domain) {
      params.domain = domain
    }

    if (startDate) {
      try {
        parseISO(startDate)
        params.startDate = startDate
      } catch {
        return NextResponse.json(
          { error: 'Invalid start date format. Use ISO 8601 format.' },
          { status: 400 }
        )
      }
    }

    if (endDate) {
      try {
        parseISO(endDate)
        params.endDate = endDate
      } catch {
        return NextResponse.json(
          { error: 'Invalid end date format. Use ISO 8601 format.' },
          { status: 400 }
        )
      }
    }

    if (limitParam) {
      const limit = parseInt(limitParam, 10)
      if (isNaN(limit) || limit < 1 || limit > 100) {
        return NextResponse.json(
          { error: 'Invalid limit parameter. Must be between 1 and 100.' },
          { status: 400 }
        )
      }
      params.limit = limit
    }

    const events = await fetchEvents(params)

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error in events API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
