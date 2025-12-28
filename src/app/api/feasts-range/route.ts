import { getFeasts } from '@/common/getFeasts'
import { parseISO } from 'date-fns'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const startDate = searchParams.get('start')
  const endDate = searchParams.get('end')

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: 'Missing required parameters: start, end' },
      { status: 400 }
    )
  }

  try {
    const start = parseISO(startDate)
    const end = parseISO(endDate)
    const feasts = await getFeasts(start, end)

    return NextResponse.json(feasts)
  } catch (error) {
    console.error('Error fetching feasts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feasts' },
      { status: 500 }
    )
  }
}
