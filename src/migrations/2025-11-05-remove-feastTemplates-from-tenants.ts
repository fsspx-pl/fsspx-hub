import { Tenant } from '@/payload-types';
import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb';

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  // Remove feastTemplates field from all tenant documents
  const pageSize = 100;
  let page = 1;
  
  for (;;) {
    const res = await payload.find({
      collection: 'tenants',
      limit: pageSize,
      page,
      depth: 0,
    } as any);

    if (!res.docs.length) break;

    for (const doc of res.docs) {
      await payload.update({
        collection: 'tenants',
        id: doc.id,
        data: { ['feastTemplates' as keyof Tenant]: undefined },
        depth: 0,
        context: { skipRevalidate: true },
      });
    }

    if (!res.page) return;
    if (res.page >= res.totalPages) break;
    page += 1;
  }
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  // Migration cannot be reversed - feastTemplates data structure is lost
  // This is a destructive migration
  payload.logger.warn('Cannot reverse feastTemplates removal - data structure lost');
}

const migration = { up, down };
export default migration;

