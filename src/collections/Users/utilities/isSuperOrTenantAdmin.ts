
import { PayloadRequest } from 'payload'
import { isSuperAdmin } from '../../../utilities/isSuperAdmin'
import { Tenant } from '@/payload-types'
import { getSubdomain } from '@/utilities/getSubdomain'
const logs = false

export const isSuperOrTenantAdmin = async (args: { req: PayloadRequest }): Promise<boolean> => {
  const domain = getSubdomain(args.req)
  const {
    req,
    req: { user, payload },
  } = args

  if(!user) {
    return false
  }

  // always allow super admins through
  if (isSuperAdmin(user)) {
    return true
  }

  if (logs) {
    const msg = `Finding tenant with domain: '${domain}'`
    payload.logger.info({ msg })
  }

  const foundTenants = await payload.find({
    collection: 'tenants',
    where: {
      'domain': {
        in: [domain],
      },
    },
    depth: 0,
    limit: 1,
    req,
  })

  // if this tenant does not exist, deny access
  if (foundTenants.totalDocs === 0) {
    if (logs) {
      const msg = `No tenant found for ${domain}`
      payload.logger.info({ msg })
    }

    return false
  }

  if (logs) {
    const msg = `Found tenant: '${foundTenants.docs?.[0]?.name}', checking if user is an tenant admin`
    payload.logger.info({ msg })
  }

  // finally check if the user is an admin of this tenant
  const tenantWithUser = user?.tenants?.find(
    ({ tenant: userTenant }) => (userTenant as Tenant)?.id === foundTenants.docs[0].id,
  )

  if (tenantWithUser?.roles?.some(role => role === 'admin')) {
    if (logs) {
      const msg = `User is an admin of ${foundTenants.docs[0].name}, allowing access`
      payload.logger.info({ msg })
    }

    return true
  }

  if (logs) {
    const msg = `User is not an admin of ${foundTenants.docs[0].name}, denying access`
    payload.logger.info({ msg })
  }

  return false
}
