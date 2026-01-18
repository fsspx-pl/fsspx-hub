#!/usr/bin/env ts-node
/**
 * Force migration script to copy data from pages to announcements collection.
 * This script will upsert all documents from pages into announcements.
 */

import configPromise from '@payload-config';
import { getPayload } from 'payload';

const LEGACY_COLLECTION = 'pages';
const LEGACY_VERSIONS_COLLECTION = 'pages_versions';
const NEW_COLLECTION = 'announcements';
const NEW_VERSIONS_COLLECTION = 'announcements_versions';

async function upsertAllById({
  source,
  target,
  label,
}: {
  source: any;
  target: any;
  label: string;
}): Promise<void> {
  const cursor = source.find({}, { allowDiskUse: true });

  const batchSize = 500;
  let ops: any[] = [];
  let processed = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const doc = await cursor.next();
    if (!doc) break;

    ops.push({
      replaceOne: {
        filter: { _id: doc._id },
        replacement: doc,
        upsert: true,
      },
    });

    if (ops.length >= batchSize) {
      await target.bulkWrite(ops, { ordered: false });
      processed += ops.length;
      console.log(`🔁 ${label}: upserted ${processed} docs...`);
      ops = [];
    }
  }

  if (ops.length) {
    await target.bulkWrite(ops, { ordered: false });
    processed += ops.length;
  }

  console.log(`✅ ${label}: upserted ${processed} docs`);
}

async function migrate() {
  console.log('🚀 Starting forced migration from pages to announcements...\n');

  const payload = await getPayload({
    config: configPromise,
  });

  const db = (payload.db as any)?.connection?.db;
  if (!db) {
    console.error('❌ MongoDB connection not available');
    process.exit(1);
  }

  const collections = await db.listCollections({}, { nameOnly: true }).toArray();
  const collectionNames = collections.map((c: any) => c.name);

  const hasPages = collectionNames.includes(LEGACY_COLLECTION);
  const hasPagesVersions = collectionNames.includes(LEGACY_VERSIONS_COLLECTION);
  const hasAnnouncements = collectionNames.includes(NEW_COLLECTION);
  const hasAnnouncementsVersions = collectionNames.includes(NEW_VERSIONS_COLLECTION);

  if (!hasPages) {
    console.log('ℹ️  No "pages" collection found. Nothing to migrate.');
    process.exit(0);
  }

  if (!hasAnnouncements) {
    console.log('⚠️  "announcements" collection does not exist. Creating it...');
    // The collection will be created automatically when we try to write to it
  }

  // Migrate main collection
  if (hasPages) {
    const pagesCol = db.collection(LEGACY_COLLECTION);
    const annCol = db.collection(NEW_COLLECTION);

    const pagesCount = await pagesCol.estimatedDocumentCount();
    const announcementsCount = await annCol.estimatedDocumentCount();

    console.log(`\n📊 Current state:`);
    console.log(`  pages: ${pagesCount} documents`);
    console.log(`  announcements: ${announcementsCount} documents`);

    if (pagesCount > 0) {
      console.log(`\n🔄 Migrating documents from ${LEGACY_COLLECTION} to ${NEW_COLLECTION}...`);
      await upsertAllById({
        source: pagesCol,
        target: annCol,
        label: `${LEGACY_COLLECTION} → ${NEW_COLLECTION}`,
      });

      const newCount = await annCol.estimatedDocumentCount();
      console.log(`✅ Migration complete. announcements now has ${newCount} documents.`);
    }
  }

  // Migrate versions collection
  if (hasPagesVersions) {
    const pagesVersionsCol = db.collection(LEGACY_VERSIONS_COLLECTION);
    const annVersionsCol = db.collection(NEW_VERSIONS_COLLECTION);

    const pagesVersionsCount = await pagesVersionsCol.estimatedDocumentCount();
    const announcementsVersionsCount = await annVersionsCol.estimatedDocumentCount();

    console.log(`\n📊 Versions state:`);
    console.log(`  pages_versions: ${pagesVersionsCount} documents`);
    console.log(`  announcements_versions: ${announcementsVersionsCount} documents`);

    if (pagesVersionsCount > 0) {
      console.log(`\n🔄 Migrating versions from ${LEGACY_VERSIONS_COLLECTION} to ${NEW_VERSIONS_COLLECTION}...`);
      await upsertAllById({
        source: pagesVersionsCol,
        target: annVersionsCol,
        label: `${LEGACY_VERSIONS_COLLECTION} → ${NEW_VERSIONS_COLLECTION}`,
      });

      const newVersionsCount = await annVersionsCol.estimatedDocumentCount();
      console.log(`✅ Versions migration complete. announcements_versions now has ${newVersionsCount} documents.`);
    }
  }

  // Verify via Payload API
  console.log('\n🔍 Verifying via Payload API...');
  try {
    const result = await payload.find({
      collection: 'announcements',
      limit: 5,
    });
    console.log(`✅ Payload API can query announcements: ${result.totalDocs} total documents`);
    if (result.docs.length > 0) {
      console.log(`   Sample document: ${result.docs[0].title || result.docs[0].id}`);
    }
  } catch (error) {
    console.error(`❌ Error querying announcements via Payload: ${error instanceof Error ? error.message : String(error)}`);
  }

  console.log('\n✅ Migration complete!');
  process.exit(0);
}

migrate().catch((error) => {
  console.error('❌ Error during migration:', error);
  process.exit(1);
});
