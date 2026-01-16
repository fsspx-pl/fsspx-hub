import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

/**
 * Fixes Payload admin/runtime serialization issues caused by legacy ObjectId values
 * inside `payload-locked-documents.document.value`, and updates old `relationTo: "pages"`
 * to `relationTo: "announcements"`.
 */
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const connection = (payload.db as any)?.connection
  const db = connection?.db

  if (!db) {
    payload.logger.warn('⚠️  MongoDB connection not available. Skipping locked-documents normalization.')
    return
  }

  const locked = db.collection('payload-locked-documents')

  // 1) Update relationTo pages -> announcements
  const relResult = await locked.updateMany(
    { 'document.relationTo': 'pages' },
    { $set: { 'document.relationTo': 'announcements' } },
  )
  payload.logger.info(
    `✅ payload-locked-documents: relationTo pages→announcements matched=${relResult.matchedCount} modified=${relResult.modifiedCount}`,
  )

  // 2) Convert ObjectId document.value -> string
  // Mongo type check is the most reliable way to detect ObjectId values.
  const cursor = locked.find(
    { 'document.value': { $type: 'objectId' } },
    { projection: { _id: 1, document: 1 } },
  )

  let updated = 0
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const doc = await cursor.next()
    if (!doc) break

    const objectId = doc.document?.value
    if (!objectId) continue

    await locked.updateOne(
      { _id: doc._id },
      { $set: { 'document.value': String(objectId) } },
    )
    updated += 1
  }

  payload.logger.info(`✅ payload-locked-documents: normalized ${updated} ObjectId value(s) to strings`)
}

export async function down({}: MigrateDownArgs): Promise<void> {
  // No-op: this is a normalization for runtime safety.
}

const migration = { up, down }
export default migration

