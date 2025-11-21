import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb';
import { ObjectId } from 'mongodb';

const SUBSCRIPTIONS_COLLECTION = 'newsletterSubscriptions';
const TENANTS_COLLECTION = 'tenants';

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const connection = (payload.db as any)?.connection;
  if (!connection) {
    console.warn('⚠️  MongoDB connection not available. Skipping subdomain removal.');
    return;
  }

  const collection = connection.collection(SUBSCRIPTIONS_COLLECTION);
  await collection.updateMany({}, { $unset: { subdomain: '' } });
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

    let tenantObjectId: ObjectId | undefined;
    if (tenantId instanceof ObjectId) {
      tenantObjectId = tenantId;
    } else if (typeof tenantId === 'string') {
      if (ObjectId.isValid(tenantId)) {
        tenantObjectId = new ObjectId(tenantId);
      }
    } else if (tenantId && typeof tenantId === 'object' && 'value' in tenantId) {
      const value = (tenantId as { value: unknown }).value;
      if (typeof value === 'string' && ObjectId.isValid(value)) {
        tenantObjectId = new ObjectId(value);
      } else if (value instanceof ObjectId) {
        tenantObjectId = value;
      }
    }

    if (!tenantObjectId) continue;

    const tenant = await tenantsCollection.findOne({ _id: tenantObjectId });
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

