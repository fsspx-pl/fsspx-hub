import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

const LEGACY_COLLECTION = 'pages'
const LEGACY_VERSIONS_COLLECTION = 'pages_versions'

const NEW_COLLECTION = 'announcements'
const NEW_VERSIONS_COLLECTION = 'announcements_versions'

type CollectionInfo = { name: string }

async function listCollectionNames(db: any): Promise<string[]> {
  const cols: CollectionInfo[] = await db.listCollections({}, { nameOnly: true }).toArray()
  return cols.map((c) => c.name)
}

async function upsertAllById({
  source,
  target,
  payload,
  label,
}: {
  source: any
  target: any
  payload: any
  label: string
}): Promise<void> {
  const cursor = source.find({}, { allowDiskUse: true })

  const batchSize = 500
  let ops: any[] = []
  let processed = 0

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const doc = await cursor.next()
    if (!doc) break

    ops.push({
      replaceOne: {
        filter: { _id: doc._id },
        replacement: doc,
        upsert: true,
      },
    })

    if (ops.length >= batchSize) {
      await target.bulkWrite(ops, { ordered: false })
      processed += ops.length
      payload.logger.info(`🔁 ${label}: upserted ${processed} docs...`)
      ops = []
    }
  }

  if (ops.length) {
    await target.bulkWrite(ops, { ordered: false })
    processed += ops.length
  }

  payload.logger.info(`✅ ${label}: upserted ${processed} docs`)
}

/**
 * Recovery migration for environments where:
 * - Payload created an empty "announcements" collection first, and
 * - the original rename migration skipped renaming "pages" → "announcements",
 * resulting in "missing" data in the UI.
 *
 * This migration is non-destructive:
 * - If both collections exist, it upserts all docs (and versions) from "pages" into "announcements".
 * - If only "pages" exists, it renames collections.
 */
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const connection = (payload.db as any)?.connection
  const db = connection?.db

  if (!db) {
    payload.logger.warn('⚠️  MongoDB connection not available. Skipping announcements recovery migration.')
    return
  }

  const names = await listCollectionNames(db)
  const hasPages = names.includes(LEGACY_COLLECTION)
  const hasPagesVersions = names.includes(LEGACY_VERSIONS_COLLECTION)
  const hasAnnouncements = names.includes(NEW_COLLECTION)
  const hasAnnouncementsVersions = names.includes(NEW_VERSIONS_COLLECTION)

  if (!hasPages && hasAnnouncements) {
    payload.logger.info('ℹ️  No legacy "pages" collection found. Nothing to recover.')
    return
  }

  if (hasPages && !hasAnnouncements) {
    payload.logger.info(`🔁 Renaming "${LEGACY_COLLECTION}" → "${NEW_COLLECTION}"...`)
    await db.renameCollection(LEGACY_COLLECTION, NEW_COLLECTION)
  }

  if (hasPagesVersions && !hasAnnouncementsVersions) {
    payload.logger.info(`🔁 Renaming "${LEGACY_VERSIONS_COLLECTION}" → "${NEW_VERSIONS_COLLECTION}"...`)
    await db.renameCollection(LEGACY_VERSIONS_COLLECTION, NEW_VERSIONS_COLLECTION)
  }

  // If both exist, upsert/mirror legacy docs into the new collection.
  if (hasPages && hasAnnouncements) {
    const pagesCol = db.collection(LEGACY_COLLECTION)
    const annCol = db.collection(NEW_COLLECTION)

    const [pagesCount, announcementsCount] = await Promise.all([
      pagesCol.estimatedDocumentCount(),
      annCol.estimatedDocumentCount(),
    ])

    payload.logger.info(
      `ℹ️  Both "${LEGACY_COLLECTION}" and "${NEW_COLLECTION}" exist (pages=${pagesCount}, announcements=${announcementsCount}). Upserting legacy docs into announcements...`,
    )

    if (pagesCount > 0) {
      await upsertAllById({
        source: pagesCol,
        target: annCol,
        payload,
        label: `${LEGACY_COLLECTION} → ${NEW_COLLECTION}`,
      })
    }
  }

  if (hasPagesVersions && hasAnnouncementsVersions) {
    const pagesVersionsCol = db.collection(LEGACY_VERSIONS_COLLECTION)
    const annVersionsCol = db.collection(NEW_VERSIONS_COLLECTION)

    const [pagesVersionsCount, announcementsVersionsCount] = await Promise.all([
      pagesVersionsCol.estimatedDocumentCount(),
      annVersionsCol.estimatedDocumentCount(),
    ])

    payload.logger.info(
      `ℹ️  Both "${LEGACY_VERSIONS_COLLECTION}" and "${NEW_VERSIONS_COLLECTION}" exist (pages_versions=${pagesVersionsCount}, announcements_versions=${announcementsVersionsCount}). Upserting legacy versions into announcements_versions...`,
    )

    if (pagesVersionsCount > 0) {
      await upsertAllById({
        source: pagesVersionsCol,
        target: annVersionsCol,
        payload,
        label: `${LEGACY_VERSIONS_COLLECTION} → ${NEW_VERSIONS_COLLECTION}`,
      })
    }
  }
}

export async function down({}: MigrateDownArgs): Promise<void> {
  // No-op: this is a recovery migration (non-destructive by design).
}

const migration = { up, down }
export default migration

