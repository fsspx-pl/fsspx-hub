import { fetchTenantById } from '@/_api/fetchTenants'
import { getServices } from '@/common/getMasses'
import { parseISO } from 'date-fns'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const tenantId = searchParams.get('tenant')
  const startDate = searchParams.get('start')
  const endDate = searchParams.get('end')

  if (!tenantId || !startDate || !endDate) {
    return NextResponse.json(
      { error: 'Missing required parameters: tenant, start, end' },
      { status: 400 }
    )
  }

  try {
    const tenant = await fetchTenantById(tenantId)
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    const start = parseISO(startDate)
    const end = parseISO(endDate)
    const services = await getServices(tenant, start, end)

    return NextResponse.json(services)
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

