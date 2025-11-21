import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb';

const SUBSCRIPTIONS_COLLECTION = 'newsletterSubscriptions';
const TENANTS_COLLECTION = 'tenants';

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const connection = (payload.db as any)?.connection;
  if (!connection) {
    console.warn('⚠️  MongoDB connection not available. Skipping field removal.');
    return;
  }

  const collection = connection.collection(SUBSCRIPTIONS_COLLECTION);
  await collection.updateMany({}, { $unset: { subdomain: '', confirmedAt: '' } });
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  const connection = (payload.db as any)?.connection;
  if (!connection) {
    console.warn('⚠️  MongoDB connection not available. Skipping subdomain restoration.');
    return;
  }

  const subscriptionsCollection = connection.collection(SUBSCRIPTIONS_COLLECTION);
  const tenantsCollection = connection.collection(TENANTS_COLLECTION);

  const cursor = subscriptionsCollection.find({}, { projection: { tenant: 1 } });

  while (await cursor.hasNext()) {
    const subscription = await cursor.next();
    if (!subscription) continue;

    const tenantId = subscription.tenant;
    if (!tenantId) continue;

    if (typeof tenantId !== 'string') continue;

    const tenant = await tenantsCollection.findOne({ _id: tenantId });
    if (!tenant?.domain) continue;

    const subdomain = tenant.domain.includes('.')
      ? tenant.domain.split('.')[0]
      : tenant.domain;

    await subscriptionsCollection.updateOne(
      { _id: subscription._id },
      { $set: { subdomain } }
    );
  }
}