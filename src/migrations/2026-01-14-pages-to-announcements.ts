import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

const LEGACY_COLLECTION = 'pages'
const LEGACY_VERSIONS_COLLECTION = 'pages_versions'

const NEW_COLLECTION = 'announcements'
const NEW_VERSIONS_COLLECTION = 'announcements_versions'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const connection = (payload.db as any)?.connection
  const db = connection?.db

  if (!db) {
    payload.logger.warn('⚠️  MongoDB connection not available. Skipping pages → announcements migration.')
    return
  }

  const existingCollections: Array<{ name: string }> = await db.listCollections({}, { nameOnly: true }).toArray()
  const hasLegacy = existingCollections.some((c) => c.name === LEGACY_COLLECTION)
  const hasLegacyVersions = existingCollections.some((c) => c.name === LEGACY_VERSIONS_COLLECTION)
  const hasNew = existingCollections.some((c) => c.name === NEW_COLLECTION)
  const hasNewVersions = existingCollections.some((c) => c.name === NEW_VERSIONS_COLLECTION)

  if (hasLegacy && !hasNew) {
    payload.logger.info(`🔁 Renaming Mongo collection "${LEGACY_COLLECTION}" → "${NEW_COLLECTION}"...`)
    await db.renameCollection(LEGACY_COLLECTION, NEW_COLLECTION)
  }

  if (hasLegacyVersions && !hasNewVersions) {
    payload.logger.info(`🔁 Renaming Mongo collection "${LEGACY_VERSIONS_COLLECTION}" → "${NEW_VERSIONS_COLLECTION}"...`)
    await db.renameCollection(LEGACY_VERSIONS_COLLECTION, NEW_VERSIONS_COLLECTION)
  }

  // Update Payload internal metadata that references collection slugs
  try {
    const locked = db.collection('payload-locked-documents')
    await locked.updateMany(
      { 'document.relationTo': LEGACY_COLLECTION },
      { $set: { 'document.relationTo': NEW_COLLECTION } },
    )
  } catch (error) {
    payload.logger.warn(
      `⚠️  Failed to update locked documents: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  try {
    const exportsCol = db.collection('exports')
    await exportsCol.updateMany(
      { collectionSlug: LEGACY_COLLECTION },
      { $set: { collectionSlug: NEW_COLLECTION } },
    )
  } catch (error) {
    payload.logger.warn(`⚠️  Failed to update exports: ${error instanceof Error ? error.message : String(error)}`)
  }

  // Rename the root media folder from "Pages" → "Announcements" (best-effort)
  try {
    const folders = db.collection('payload-folders')
    await folders.updateMany(
      { name: 'Pages', folder: null, folderType: { $in: ['media'] } },
      { $set: { name: 'Announcements' } },
    )
  } catch (error) {
    payload.logger.warn(`⚠️  Failed to rename media folders: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  const connection = (payload.db as any)?.connection
  const db = connection?.db

  if (!db) {
    payload.logger.warn('⚠️  MongoDB connection not available. Skipping announcements → pages rollback.')
    return
  }

  const existingCollections: Array<{ name: string }> = await db.listCollections({}, { nameOnly: true }).toArray()
  const hasLegacy = existingCollections.some((c) => c.name === LEGACY_COLLECTION)
  const hasLegacyVersions = existingCollections.some((c) => c.name === LEGACY_VERSIONS_COLLECTION)
  const hasNew = existingCollections.some((c) => c.name === NEW_COLLECTION)
  const hasNewVersions = existingCollections.some((c) => c.name === NEW_VERSIONS_COLLECTION)

  if (hasNew && !hasLegacy) {
    payload.logger.info(`🔁 Renaming Mongo collection "${NEW_COLLECTION}" → "${LEGACY_COLLECTION}"...`)
    await db.renameCollection(NEW_COLLECTION, LEGACY_COLLECTION)
  }

  if (hasNewVersions && !hasLegacyVersions) {
    payload.logger.info(`🔁 Renaming Mongo collection "${NEW_VERSIONS_COLLECTION}" → "${LEGACY_VERSIONS_COLLECTION}"...`)
    await db.renameCollection(NEW_VERSIONS_COLLECTION, LEGACY_VERSIONS_COLLECTION)
  }

  try {
    const locked = db.collection('payload-locked-documents')
    await locked.updateMany(
      { 'document.relationTo': NEW_COLLECTION },
      { $set: { 'document.relationTo': LEGACY_COLLECTION } },
    )
  } catch (error) {
    payload.logger.warn(
      `⚠️  Failed to update locked documents: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  try {
    const exportsCol = db.collection('exports')
    await exportsCol.updateMany(
      { collectionSlug: NEW_COLLECTION },
      { $set: { collectionSlug: LEGACY_COLLECTION } },
    )
  } catch (error) {
    payload.logger.warn(`⚠️  Failed to update exports: ${error instanceof Error ? error.message : String(error)}`)
  }

  try {
    const folders = db.collection('payload-folders')
    await folders.updateMany(
      { name: 'Announcements', folder: null, folderType: { $in: ['media'] } },
      { $set: { name: 'Pages' } },
    )
  } catch (error) {
    payload.logger.warn(`⚠️  Failed to rename media folders: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const migration = { up, down }
export default migration

