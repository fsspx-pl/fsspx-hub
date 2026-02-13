import { fetchTenants, fetchTenant, fetchTenantById } from '@/_api/fetchTenants'
import { verifyApiToken } from '@/utilities/verifyApiToken'
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
    const id = searchParams.get('id')
    const domain = searchParams.get('domain')

    if (id) {
      const tenant = await fetchTenantById(id)
      if (!tenant) {
        return NextResponse.json(
          { error: 'Tenant not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(tenant)
    }

    if (domain) {
      const tenant = await fetchTenant(domain)
      if (!tenant) {
        return NextResponse.json(
          { error: 'Tenant not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(tenant)
    }

    const tenants = await fetchTenants()
    return NextResponse.json(tenants)
  } catch (error) {
    console.error('Error in tenants API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

