import { CollectionAfterLoginHook } from "payload"
import { getSubdomain } from "@/utilities/getSubdomain"
export const recordLastLoggedInTenant: CollectionAfterLoginHook = async ({ req, user }) => {
  const domain = getSubdomain(req)
  try {
    const relatedOrg = await req.payload
      .find({
        collection: 'tenants',
        where: {
          'domain': {
            in: [domain],
          },
        },
        depth: 0,
        limit: 1,
      })
      ?.then(res => res.docs?.[0])

    await req.payload.update({
      id: user.id,
      collection: 'users',
      data: {
        lastLoggedInTenant: relatedOrg?.id ?? null,
      },
      req,
    })
  } catch (err: unknown) {
    req.payload.logger.error(`Error recording last logged in tenant for user ${user.id}: ${err}`)
  }

  return user
}
