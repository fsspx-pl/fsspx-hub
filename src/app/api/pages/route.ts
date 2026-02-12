import { fetchPages } from '@/_api/fetchPages'
import { parseISO } from 'date-fns'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenant')
    const domain = searchParams.get('domain')
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')
    const type = searchParams.get('type')
    const limitParam = searchParams.get('limit')
    const published = searchParams.get('published')

    const params: Parameters<typeof fetchPages>[0] = {}

    if (tenantId) {
      params.tenantId = tenantId
    }

    if (domain) {
      params.domain = domain
    }

    if (type) {
      params.type = type
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

    if (published !== null) {
      params.published = published !== 'false'
    }

    const pages = await fetchPages(params)

    return NextResponse.json(pages)
  } catch (error) {
    console.error('Error in pages API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
