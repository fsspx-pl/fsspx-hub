import { Tenant } from '@/payload-types';
import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb';

const locationFields = ['city', 'type', 'patron', 'coverBackground', 'address'] as const;
type LocationField = (typeof locationFields)[number];
type GeneralGroup = NonNullable<Tenant['general']>;

type LegacyTenant = Tenant & {
  domain?: GeneralGroup extends { domain?: infer D } ? D : string | null;
} & {
  [K in LocationField]?: GeneralGroup[K];
} & {
  domains?: unknown;
  senderListId?: unknown;
};

/**
 * Migration to move domain and location fields into the general group.
 *
 * Moves:
 * - domain -> general.domain
 * - city, type, patron, coverBackground, address -> general.*
 */
export async function up({ payload }: MigrateUpArgs): Promise<void> {
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

    const tenants = res.docs as LegacyTenant[];

    for (const doc of tenants) {
      const data: Record<string, unknown> = {};
      const generalDraft: Record<string, unknown> = { ...(doc.general ?? {}) };
      let needsUpdate = false;

      if (doc.domain !== undefined) {
        if (generalDraft.domain === undefined) {
          generalDraft.domain = doc.domain;
        }
        data.domain = undefined;
        needsUpdate = true;
      }

      const obsoleteRootFields = ['domains', 'senderListId'] as const;
      for (const obsoleteField of obsoleteRootFields) {
        if (doc[obsoleteField] !== undefined) {
          data[obsoleteField] = undefined;
          needsUpdate = true;
        }
      }

      for (const field of locationFields) {
        if (doc[field] !== undefined) {
          if (generalDraft[field] === undefined) {
            generalDraft[field] = doc[field];
          }
          data[field] = undefined;
          needsUpdate = true;
        }
      }

      if (!needsUpdate) continue;

      data.general = generalDraft;

      await payload.update({
        collection: 'tenants',
        id: doc.id,
        data,
        depth: 0,
        context: { skipRevalidate: true },
      });
    }

    if (!res.page || res.page >= res.totalPages) break;
    page += 1;
  }
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
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

    const tenants = res.docs as LegacyTenant[];

    for (const doc of tenants) {
      const data: Record<string, unknown> = {};
      const generalDraft: Record<string, unknown> = { ...(doc.general ?? {}) };
      let needsUpdate = false;

      if (doc.general?.domain !== undefined) {
        if (doc.domain === undefined) {
          data.domain = doc.general.domain;
        }
        delete generalDraft.domain;
        needsUpdate = true;
      }
      for (const field of locationFields) {
        if (doc.general?.[field] !== undefined) {
          if (doc[field] === undefined) {
            data[field] = doc.general[field];
          }
          delete generalDraft[field];
          needsUpdate = true;
        }
      }

      if (!needsUpdate) continue;

      data.general = Object.keys(generalDraft).length ? generalDraft : undefined;

      await payload.update({
        collection: 'tenants',
        id: doc.id,
        data,
        depth: 0,
        context: { skipRevalidate: true },
      });
    }

    if (!res.page || res.page >= res.totalPages) break;
    page += 1;
  }
}

const migration = { up, down };
export default migration;

