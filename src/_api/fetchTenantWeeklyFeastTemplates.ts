import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const fetchTenantWeeklyFeastTemplates = async (tenantId: string) => {
  const payload = await getPayload({ config: configPromise })
  const res = await payload.find({
    collection: 'feastTemplates',
    where: { tenant: { equals: tenantId } },
    limit: 1000,
  })
  return res.docs
}


