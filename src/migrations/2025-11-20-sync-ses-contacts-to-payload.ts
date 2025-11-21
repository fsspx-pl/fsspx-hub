/**
 * Migration to sync existing AWS SES contacts into Payload newsletter subscriptions
 * 
 * up: Syncs SES contacts to Payload
 *   - Fetches all tenants with newsletter configuration (mailingGroupId + topicName)
 *   - For each tenant, fetches all contacts from SES contact list
 *   - For each contact subscribed to the tenant's topic, creates/updates Payload subscription
 * 
 * down: Removes subscriptions that were created by this migration
 *   - Removes confirmed subscriptions that match the sync pattern
 *   - Note: This is best-effort and may not perfectly reverse the migration
 */

import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb';
import { SESv2Client, ListContactsCommand } from '@aws-sdk/client-sesv2';
import { Tenant } from '@/payload-types';

// Validate AWS configuration
function validateAWSConfig() {
  if (!process.env.AWS_REGION) {
    throw new Error('AWS_REGION environment variable is not set');
  }
  if (!process.env.AWS_ACCESS_KEY_ID) {
    throw new Error('AWS_ACCESS_KEY_ID environment variable is not set');
  }
  if (!process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS_SECRET_ACCESS_KEY environment variable is not set');
  }
}

function getSESClient(): SESv2Client {
  validateAWSConfig();
  return new SESv2Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

/**
 * Extract subdomain from domain (e.g., "poznan.fsspx.pl" -> "poznan")
 */
function extractSubdomain(domain: string): string {
  return domain.split('.')[0];
}

/**
 * Fetch all contacts from a SES contact list
 */
async function fetchAllContactsFromSES(
  sesClient: SESv2Client,
  contactListName: string
): Promise<Array<{ email: string; topics: Array<{ name: string; status: string }> }>> {
  const contacts: Array<{ email: string; topics: Array<{ name: string; status: string }> }> = [];
  let nextToken: string | undefined;

  do {
    const command = new ListContactsCommand({
      ContactListName: contactListName,
      PageSize: 1000,
      NextToken: nextToken,
    });

    const response = await sesClient.send(command);
    
    if (response.Contacts) {
      for (const contact of response.Contacts) {
        if (contact.EmailAddress) {
          const topics = (contact.TopicPreferences || []).map(topic => ({
            name: topic.TopicName || '',
            status: topic.SubscriptionStatus || '',
          }));

          contacts.push({
            email: contact.EmailAddress,
            topics,
          });
        }
      }
    }

    nextToken = response.NextToken;
  } while (nextToken);

  return contacts;
}

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  console.log('🚀 Starting SES to Payload contact sync...\n');

  const sesClient = getSESClient();

  // Get all tenants with newsletter configuration
  const tenants = await payload.find({
    collection: 'tenants',
    where: {
      and: [
        { mailingGroupId: { exists: true } },
        { topicName: { exists: true } },
      ],
    },
    limit: 1000,
  });

  if (tenants.docs.length === 0) {
    console.log('⚠️  No tenants found with newsletter configuration (mailingGroupId + topicName)');
    return;
  }

  console.log(`📋 Found ${tenants.docs.length} tenant(s) with newsletter configuration\n`);

  let totalProcessed = 0;
  let totalCreated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const tenant of tenants.docs as Tenant[]) {
    const contactListName = tenant.mailingGroupId;
    const topicName = tenant.topicName;
    const domain = tenant.domain;
    const subdomain = extractSubdomain(domain);

    if (!contactListName || !topicName) {
      console.log(`⏭️  Skipping tenant ${tenant.name} (${domain}) - missing mailingGroupId or topicName`);
      continue;
    }

    console.log(`\n📧 Processing tenant: ${tenant.name} (${domain})`);
    console.log(`   Contact List: ${contactListName}`);
    console.log(`   Topic: ${topicName}`);
    console.log(`   Subdomain: ${subdomain}`);

    try {
      // Fetch all contacts from SES
      console.log(`   Fetching contacts from SES...`);
      const sesContacts = await fetchAllContactsFromSES(sesClient, contactListName);
      console.log(`   Found ${sesContacts.length} contact(s) in SES`);

      // Filter contacts subscribed to this tenant's topic
      const subscribedContacts = sesContacts.filter(contact =>
        contact.topics.some(topic => topic.name === topicName && topic.status === 'OPT_IN')
      );

      console.log(`   ${subscribedContacts.length} contact(s) subscribed to topic "${topicName}"`);

      // Process each subscribed contact
      for (const contact of subscribedContacts) {
        totalProcessed++;

        try {
          // Check if subscription already exists in Payload
          const existing = await payload.find({
            collection: 'newsletterSubscriptions',
            where: {
              and: [
                { email: { equals: contact.email } },
                { subdomain: { equals: subdomain } },
              ],
            },
            limit: 1,
          });

          if (existing.docs.length > 0) {
            const existingSubscription = existing.docs[0];
            
            // If status is pending, update to confirmed (they're already in SES)
            if (existingSubscription.status === 'pending') {
              await payload.update({
                collection: 'newsletterSubscriptions',
                id: existingSubscription.id,
                data: {
                  status: 'confirmed',
                  confirmedAt: new Date().toISOString(),
                },
              });
              console.log(`   ✅ Updated subscription for ${contact.email} (pending → confirmed)`);
              totalCreated++;
            } else {
              totalSkipped++;
            }
            continue;
          }

          // Create new subscription with confirmed status (they're already in SES)
          await payload.create({
            collection: 'newsletterSubscriptions',
            data: {
              email: contact.email,
              subdomain,
              tenant: tenant.id,
              status: 'confirmed',
              confirmedAt: new Date().toISOString(),
            },
          });

          console.log(`   ✅ Created subscription for ${contact.email}`);
          totalCreated++;
        } catch (error) {
          console.error(`   ❌ Error processing ${contact.email}:`, error instanceof Error ? error.message : 'Unknown error');
          totalErrors++;
        }
      }
    } catch (error) {
      console.error(`   ❌ Error fetching contacts for tenant ${tenant.name}:`, error instanceof Error ? error.message : 'Unknown error');
      totalErrors++;
    }
  }

  console.log(`\n\n📊 Migration Summary:`);
  console.log(`   Total contacts processed: ${totalProcessed}`);
  console.log(`   Subscriptions created/updated: ${totalCreated}`);
  console.log(`   Subscriptions skipped (already exist): ${totalSkipped}`);
  console.log(`   Errors: ${totalErrors}`);
  console.log(`\n✅ Migration completed!`);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  console.log('🔄 Reverting SES to Payload contact sync...\n');

  // Get all tenants with newsletter configuration
  const tenants = await payload.find({
    collection: 'tenants',
    where: {
      and: [
        { mailingGroupId: { exists: true } },
        { topicName: { exists: true } },
      ],
    },
    limit: 1000,
  });

  if (tenants.docs.length === 0) {
    console.log('⚠️  No tenants found with newsletter configuration');
    return;
  }

  console.log(`📋 Found ${tenants.docs.length} tenant(s) with newsletter configuration\n`);

  let totalRemoved = 0;
  let totalErrors = 0;

  for (const tenant of tenants.docs as Tenant[]) {
    const domain = tenant.domain;
    const subdomain = extractSubdomain(domain);

    console.log(`\n📧 Processing tenant: ${tenant.name} (${domain})`);
    console.log(`   Subdomain: ${subdomain}`);

    try {
      // Find all confirmed subscriptions for this subdomain
      // Note: This is best-effort - we remove confirmed subscriptions that match the pattern
      // It may not perfectly reverse the migration if subscriptions were created through other means
      const subscriptions = await payload.find({
        collection: 'newsletterSubscriptions',
        where: {
          and: [
            { subdomain: { equals: subdomain } },
            { status: { equals: 'confirmed' } },
            { confirmedAt: { exists: true } },
          ],
        },
        limit: 1000,
      });

      console.log(`   Found ${subscriptions.docs.length} confirmed subscription(s) to check`);

      for (const subscription of subscriptions.docs) {
        try {
          // Only remove if it matches the tenant
          if (typeof subscription.tenant === 'object' && subscription.tenant?.id === tenant.id) {
            await payload.delete({
              collection: 'newsletterSubscriptions',
              id: subscription.id,
            });
            console.log(`   ✅ Removed subscription for ${subscription.email}`);
            totalRemoved++;
          } else if (typeof subscription.tenant === 'string' && subscription.tenant === tenant.id) {
            await payload.delete({
              collection: 'newsletterSubscriptions',
              id: subscription.id,
            });
            console.log(`   ✅ Removed subscription for ${subscription.email}`);
            totalRemoved++;
          }
        } catch (error) {
          console.error(`   ❌ Error removing subscription ${subscription.id}:`, error instanceof Error ? error.message : 'Unknown error');
          totalErrors++;
        }
      }
    } catch (error) {
      console.error(`   ❌ Error processing tenant ${tenant.name}:`, error instanceof Error ? error.message : 'Unknown error');
      totalErrors++;
    }
  }

  console.log(`\n\n📊 Rollback Summary:`);
  console.log(`   Subscriptions removed: ${totalRemoved}`);
  console.log(`   Errors: ${totalErrors}`);
  console.log(`\n✅ Rollback completed!`);
  console.log(`\n⚠️  Note: This rollback is best-effort and may not perfectly reverse the migration.`);
}

const migration = { up, down };
export default migration;

