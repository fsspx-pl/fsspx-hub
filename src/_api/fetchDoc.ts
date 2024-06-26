export const fetchLatestDoc = async <T>(domain: string): Promise<T> => {
  try {
    const fetchUrl = `http://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}:${process.env.PORT}/api/pages?where[tenant.domains.domain][contains]=${domain}&sort=-createdAt&limit=1`;
    const req = await fetch(fetchUrl);
    return await req.json();
  } catch (err: unknown) {
    return Promise.reject(err);
  }
};
