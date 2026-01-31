import { Page } from '@/payload-types';
import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-d1';

// Removes legacy campaignId values from existing Page documents.
// Note: Keep the schema field temporarily so this migration can query it.
// After running this, you can safely remove the field from the Pages schema.

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const pageSize = 100
  let page = 1

  for (;;) {
    const res = await payload.find({
      collection: 'pages',
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
        collection: 'pages',
        id: doc.id,
        data: { ['campaignId' as keyof Page]: undefined },
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


