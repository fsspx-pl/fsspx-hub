import { CollectionAfterLoginHook } from "payload"

export const recordLastLoggedInTenant: CollectionAfterLoginHook = async ({ req, user }) => {
  try {
    const relatedOrg = await req.payload
      .find({
        collection: 'tenants',
        where: {
          'domain': {
            in: [req.headers.get('host')],
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
