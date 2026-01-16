import { Announcement } from '@/payload-types';
import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb';

// Removes legacy campaignId values from existing Announcement documents.
// Note: Keep the schema field temporarily so this migration can query it.
// After running this, you can safely remove the field from the Announcements schema.

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const pageSize = 100
  let page = 1

  for (;;) {
    const res = await payload.find({
      collection: 'announcements',
      where: {
        type: { equals: 'pastoral-announcements' },
      },
      limit: pageSize,
      page,
      depth: 0,
    })

    if (!res.docs.length) break

    for (const doc of res.docs) {
      // Skip if campaignId field doesn't exist or is empty
      if (!('campaignId' in doc) || !doc.campaignId) continue

      await payload.update({
        collection: 'announcements',
        id: doc.id,
        data: { ['campaignId' as keyof Announcement]: undefined },
        depth: 0,
        context: { skipRevalidate: true },
      })
    }

    if (!res.page || res.page >= res.totalPages) break
    page += 1
  }
}

export async function down({}: MigrateDownArgs): Promise<void> {
  // No-op: campaignId was legacy-only; we do not restore it.
}

const migration = { up, down };
export default migration;


