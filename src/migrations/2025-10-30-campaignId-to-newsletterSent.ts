import type { MigrateDownArgs, MigrateUpArgs } from 'payload/migrations';

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const pageSize = 100;
  let page = 1;
  for (;;) {
    const res = await payload.find({
      collection: 'pages',
      where: {
        and: [
          { type: { equals: 'pastoral-announcements' } },
          // campaignId existed previously; treat any truthy string as sent
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
        data: { newsletterSent: true },
        depth: 0,
      });
    }

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
        data: { newsletterSent: false },
        depth: 0,
      });
    }
    if (res.page >= res.totalPages) break;
    page += 1;
  }
}

export default { up, down };
