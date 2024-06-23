export const fetchLatestDoc = async <T>(domain: string): Promise<T> => {
  try {
    const req = await fetch(
      `http://${domain}:3000/api/pages?where[tenant.domains.domain][equals]=${domain}:3000&sort=-createdAt&limit=1`,
    )
    return await req.json()
  } catch (err: unknown) {
    // eslint-disable-next-line no-console
    console.log(err)
  }
}
