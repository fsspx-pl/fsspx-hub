#!/usr/bin/env ts-node
/**
 * Diagnostic script to check the state of pages vs announcements collections
 * and ensure data is properly migrated.
 */

import configPromise from '@payload-config';
import { getPayload } from 'payload';

async function checkCollections() {
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

  const hasPages = collectionNames.includes('pages');
  const hasPagesVersions = collectionNames.includes('pages_versions');
  const hasAnnouncements = collectionNames.includes('announcements');
  const hasAnnouncementsVersions = collectionNames.includes('announcements_versions');

  console.log('\n📊 Collection Status:');
  console.log(`  pages: ${hasPages ? '✅ exists' : '❌ missing'}`);
  console.log(`  pages_versions: ${hasPagesVersions ? '✅ exists' : '❌ missing'}`);
  console.log(`  announcements: ${hasAnnouncements ? '✅ exists' : '❌ missing'}`);
  console.log(`  announcements_versions: ${hasAnnouncementsVersions ? '✅ exists' : '❌ missing'}`);

  let pagesCount = 0;
  let announcementsCount = 0;
  let pagesVersionsCount = 0;
  let announcementsVersionsCount = 0;

  if (hasPages) {
    pagesCount = await db.collection('pages').estimatedDocumentCount();
    console.log(`\n📄 pages collection: ${pagesCount} documents`);
  }

  if (hasAnnouncements) {
    announcementsCount = await db.collection('announcements').estimatedDocumentCount();
    console.log(`📢 announcements collection: ${announcementsCount} documents`);
  }

  if (hasPagesVersions) {
    pagesVersionsCount = await db.collection('pages_versions').estimatedDocumentCount();
    console.log(`📄 pages_versions collection: ${pagesVersionsCount} documents`);
  }

  if (hasAnnouncementsVersions) {
    announcementsVersionsCount = await db.collection('announcements_versions').estimatedDocumentCount();
    console.log(`📢 announcements_versions collection: ${announcementsVersionsCount} documents`);
  }

  // Check via Payload API
  console.log('\n🔍 Checking via Payload API:');
  try {
    const payloadAnnouncements = await payload.find({
      collection: 'announcements',
      limit: 1,
    });
    console.log(`  Payload 'announcements' query: ${payloadAnnouncements.totalDocs} total documents`);
  } catch (error) {
    console.error(`  ❌ Error querying announcements: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Recommendations
  console.log('\n💡 Recommendations:');
  if (hasPages && pagesCount > 0 && (!hasAnnouncements || announcementsCount === 0)) {
    console.log('  ⚠️  Data exists in "pages" but "announcements" is empty!');
    console.log('  → Run the recovery migration: pnpm payload migrate');
    console.log('  → Or manually run: node scripts/migrate-pages-to-announcements.ts');
  } else if (hasPages && hasAnnouncements && pagesCount > 0 && announcementsCount === 0) {
    console.log('  ⚠️  Both collections exist, but announcements is empty!');
    console.log('  → The recovery migration should copy data from pages to announcements');
    console.log('  → Run: pnpm payload migrate');
  } else if (!hasPages && hasAnnouncements && announcementsCount > 0) {
    console.log('  ✅ Migration appears complete - announcements has data, pages is gone');
  } else if (hasPages && pagesCount === 0 && hasAnnouncements && announcementsCount > 0) {
    console.log('  ✅ Migration appears complete - announcements has data');
  } else if (!hasPages && !hasAnnouncements) {
    console.log('  ⚠️  Neither collection exists - this is unexpected');
  }

  process.exit(0);
}

checkCollections().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
