import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

type AnyObject = Record<string, unknown>

function isObjectIdLike(value: unknown): value is { _bsontype?: string; toHexString?: () => string; toString: () => string } {
  return Boolean(value) && typeof value === 'object' && typeof (value as any).toString === 'function'
}

function normalizeValue(input: unknown): { value: unknown; changed: boolean } {
  // Convert bare ObjectId-like values to strings (preferences are UI-only)
  if (isObjectIdLike(input) && (input as any)._bsontype === 'ObjectId') {
    return { value: String(input), changed: true }
  }

  if (Array.isArray(input)) {
    let changed = false
    const out = input.map((item) => {
      const res = normalizeValue(item)
      changed = changed || res.changed
      return res.value
    })
    return { value: out, changed }
  }

  if (!input || typeof input !== 'object') {
    return { value: input, changed: false }
  }

  const obj = input as AnyObject

  // Payload polymorphic relationship shape: { relationTo: string, value: <id|doc> }
  if (obj.relationTo === 'pages' && 'value' in obj) {
    const normalized = normalizeValue(obj.value)
    return {
      value: {
        ...obj,
        relationTo: 'announcements',
        value: normalized.value,
      },
      changed: true || normalized.changed,
    }
  }

  let changed = false
  const out: AnyObject = {}
  for (const [key, val] of Object.entries(obj)) {
    const res = normalizeValue(val)
    out[key] = res.value
    changed = changed || res.changed
  }

  return { value: out, changed }
}

/**
 * Fixes Payload admin/runtime serialization issues caused by legacy ObjectId values
 * inside `payload-preferences.value`, and updates old `relationTo: "pages"`
 * to `relationTo: "announcements"` (nested anywhere in the preferences blob).
 */
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const connection = (payload.db as any)?.connection
  const db = connection?.db

  if (!db) {
    payload.logger.warn('⚠️  MongoDB connection not available. Skipping preferences normalization.')
    return
  }

  const prefs = db.collection('payload-preferences')
  const cursor = prefs.find({}, { projection: { _id: 1, value: 1 } })

  let updated = 0
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const doc = await cursor.next()
    if (!doc) break

    const res = normalizeValue(doc.value)
    if (!res.changed) continue

    await prefs.updateOne({ _id: doc._id }, { $set: { value: res.value } })
    updated += 1
  }

  payload.logger.info(`✅ payload-preferences: normalized ${updated} preference document(s)`)
}

export async function down({}: MigrateDownArgs): Promise<void> {
  // No-op: normalization for runtime safety.
}

const migration = { up, down }
export default migration

