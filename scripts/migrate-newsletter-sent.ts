import { getPayload } from 'payload';

async function migrateNewsletterSent() {
  const payload = await getPayload({ config: await import('../payload.config') });

  const { docs: pages } = await payload.find({
    collection: 'pages',
    where: { type: { equals: 'pastoral-announcements' } },
    limit: 0, // Get all
  });

  let updatedCount = 0;

  for (const page of pages) {
    if (page.campaignId) {
      await payload.update({
        collection: 'pages',
        id: page.id,
        data: {
          newsletterSent: true,
          campaignId: null, // Clear old field
        },
      });
      updatedCount++;
    }
  }

  console.log(`Migration complete: Updated ${updatedCount} pages.`);
}

migrateNewsletterSent().catch(console.error);
