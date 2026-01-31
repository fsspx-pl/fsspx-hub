import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-d1';

const SUBSCRIPTIONS_COLLECTION = 'newsletterSubscriptions';
const TENANTS_COLLECTION = 'tenants';

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const pageSize = 100;
  let page = 1;

  for (;;) {
    const res = await payload.find({
      collection: SUBSCRIPTIONS_COLLECTION,
      limit: pageSize,
      page,
      depth: 0,
    });

    if (!res.docs.length) break;

    for (const doc of res.docs) {
      // Remove subdomain and confirmedAt fields if they exist
      const updateData: Record<string, undefined> = {};
      
      if ('subdomain' in doc) {
        updateData.subdomain = undefined;
      }
      if ('confirmedAt' in doc) {
        updateData.confirmedAt = undefined;
      }

      if (Object.keys(updateData).length > 0) {
        await payload.update({
          collection: SUBSCRIPTIONS_COLLECTION,
          id: doc.id,
          data: updateData,
          depth: 0,
        });
      }
    }

    if (!res.page || res.page >= res.totalPages) break;
    page += 1;
  }
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  // Get all tenants to map tenant IDs to subdomains
  const tenantsRes = await payload.find({
    collection: TENANTS_COLLECTION,
    limit: 1000,
    depth: 0,
  });

  const tenantSubdomainMap = new Map<string, string>();
  for (const tenant of tenantsRes.docs) {
    if (tenant.domain) {
      const subdomain = tenant.domain.includes('.')
        ? tenant.domain.split('.')[0]
        : tenant.domain;
      tenantSubdomainMap.set(tenant.id, subdomain);
    }
  }

  // Restore subdomain field for subscriptions
  const pageSize = 100;
  let page = 1;

  for (;;) {
    const res = await payload.find({
      collection: SUBSCRIPTIONS_COLLECTION,
      limit: pageSize,
      page,
      depth: 0,
    });

    if (!res.docs.length) break;

    for (const doc of res.docs) {
      const tenantId = typeof doc.tenant === 'string' 
        ? doc.tenant 
        : (doc.tenant as any)?.id;

      if (tenantId && tenantSubdomainMap.has(tenantId)) {
        const subdomain = tenantSubdomainMap.get(tenantId)!;
        await payload.update({
          collection: SUBSCRIPTIONS_COLLECTION,
          id: doc.id,
          data: { subdomain },
          depth: 0,
        });
      }
    }

    if (!res.page || res.page >= res.totalPages) break;
    page += 1;
  }
}