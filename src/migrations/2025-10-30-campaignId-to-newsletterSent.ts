import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb';

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const pageSize = 100;
  let page = 1;
  for (;;) {
    const res = await payload.find({
      collection: 'pages',
      where: {
        and: [
          { type: { equals: 'pastoral-announcements' } },
          { campaignId: { not_equals: '' } },
        ],
      },
      limit: pageSize,
      page,
      depth: 0,
    } as any);

    if (!res.docs.length) break;

    for (const doc of res.docs) {
      await payload.update({
        collection: 'pages',
        id: doc.id,
        data: { newsletter: { sent: true } },
        depth: 0,
      });
    }

    if(!res.page) return
    if (res.page >= res.totalPages) break;
    page += 1;
  }
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  // Best-effort: reset the flag to false for pastoral-announcements
  const pageSize = 100;
  let page = 1;
  for (;;) {
    const res = await payload.find({
      collection: 'pages',
      where: { type: { equals: 'pastoral-announcements' } },
      limit: pageSize,
      page,
      depth: 0,
    });
    if (!res.docs.length) break;
    for (const doc of res.docs) {
      await payload.update({
        collection: 'pages',
        id: doc.id,
        data: { newsletter: { sent: false } },
        depth: 0,
      });
    }
    if(!res.page) return
    if (res.page >= res.totalPages) break;
    page += 1;
  }
}

const migration = { up, down };
export default migration;
