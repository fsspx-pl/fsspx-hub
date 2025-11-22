import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-mongodb'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const { db } = payload

  try {
    // Create compound index for tenant + slug uniqueness
    await db.collection('events').createIndex(
      { tenant: 1, slug: 1 },
      { unique: true, name: 'tenant_slug_unique' }
    )

    // Create index on slug for faster lookups
    await db.collection('events').createIndex(
      { slug: 1 },
      { name: 'slug_index' }
    )

    // Create index on tenant for filtering
    await db.collection('events').createIndex(
      { tenant: 1 },
      { name: 'tenant_index' }
    )

    console.log('✅ Events collection indexes created successfully')
  } catch (error) {
    console.error('❌ Error creating Events indexes:', error)
    throw error
  }
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  const { db } = payload

  try {
    await db.collection('events').dropIndex('tenant_slug_unique')
    await db.collection('events').dropIndex('slug_index')
    await db.collection('events').dropIndex('tenant_index')

    console.log('✅ Events collection indexes dropped successfully')
  } catch (error) {
    console.error('❌ Error dropping Events indexes:', error)
    throw error
  }
}
