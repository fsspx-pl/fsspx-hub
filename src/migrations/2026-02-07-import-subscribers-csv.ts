/**
 * Migration: Import newsletter subscribers from CSV in S3.
 *
 * up: Reads CSV from AWS_S3_BUCKET, key subscriber-migrations/new-subscribers-07-02-2026.csv,
 *     creates newsletterSubscriptions (email + tenant + confirmed).
 * down: Removes subscriptions that match the CSV rows (same email + tenant). Best-effort.
 */

import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const DEFAULT_S3_KEY = 'subscriber-migrations/new-subscribers-07-02-2026.csv';

type CsvRow = { email: string; miasto: string };

function parseCsv(csvText: string): CsvRow[] {
  const lines = csvText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase();
  if (!header.startsWith('email') || !header.includes('miasto')) {
    throw new Error(`Unexpected CSV header: ${lines[0]}. Expected "Email,miasto".`);
  }

  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const idx = line.indexOf(',');
    if (idx === -1) continue;
    const email = line.slice(0, idx).trim().replace(/^"|"$/g, '');
    const miasto = line.slice(idx + 1).trim().replace(/^"|"$/g, '');
    if (!email || !miasto) continue;
    rows.push({ email, miasto });
  }
  return rows;
}

function getCsvContent(): Promise<string> {
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) {
    throw new Error('AWS_S3_BUCKET is not set');
  }

  const region = process.env.AWS_REGION || 'eu-central-1';
  const accessKeyId =
    process.env.AWS_ACCESS_KEY_ID || process.env.AWS_S3_ACCESS_KEY_ID;
  const secretAccessKey =
    process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_S3_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      'AWS credentials required for S3 (AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY or AWS_S3_*)'
    );
  }

  const s3 = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });

  return s3
    .send(new GetObjectCommand({ Bucket: bucket, Key: DEFAULT_S3_KEY }))
    .then((res) => {
      if (!res.Body) throw new Error(`Empty body: s3://${bucket}/${DEFAULT_S3_KEY}`);
      return res.Body.transformToString();
    });
}

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  console.log('Importing subscribers from CSV...\n');

  const csvText = await getCsvContent();
  const rows = parseCsv(csvText);
  if (rows.length === 0) {
    console.log('No data rows in CSV. Exiting.');
    return;
  }

  console.log(`Parsed ${rows.length} row(s) from CSV.\n`);

  const tenants = await payload.find({
    collection: 'tenants',
    limit: 500,
  });
  const tenantsByDomain = new Map<string, string>(
    (tenants.docs as { id: string; domain?: string }[]).map((t) => [
      (t.domain || '').toLowerCase().trim(),
      t.id,
    ])
  );

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of rows) {
    const tenantId = tenantsByDomain.get(row.miasto.toLowerCase().trim());
    if (!tenantId) {
      console.warn(`Unknown miasto/domain: ${row.miasto}. Skipping ${row.email}`);
      errors++;
      continue;
    }

    try {
      const existing = await payload.find({
        collection: 'newsletterSubscriptions',
        where: {
          and: [
            { email: { equals: row.email } },
            { tenant: { equals: tenantId } },
          ],
        },
        limit: 1,
      });

      if (existing.docs.length > 0) {
        skipped++;
        continue;
      }

      await payload.create({
        collection: 'newsletterSubscriptions',
        data: {
          email: row.email,
          tenant: tenantId,
          status: 'confirmed',
        },
      });
      created++;
    } catch (e) {
      console.error(`Error creating subscription ${row.email} @ ${row.miasto}:`, e);
      errors++;
    }
  }

  console.log(`Created: ${created}, skipped (existing): ${skipped}, errors: ${errors}`);
  console.log('Import completed.');
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  console.log('Reverting subscriber CSV import...\n');

  const csvText = await getCsvContent();
  const rows = parseCsv(csvText);
  if (rows.length === 0) return;

  const tenants = await payload.find({
    collection: 'tenants',
    limit: 500,
  });
  const tenantsByDomain = new Map<string, string>(
    (tenants.docs as { id: string; domain?: string }[]).map((t) => [
      (t.domain || '').toLowerCase().trim(),
      t.id,
    ])
  );

  let removed = 0;
  let errors = 0;

  for (const row of rows) {
    const tenantId = tenantsByDomain.get(row.miasto.toLowerCase().trim());
    if (!tenantId) continue;

    try {
      const found = await payload.find({
        collection: 'newsletterSubscriptions',
        where: {
          and: [
            { email: { equals: row.email } },
            { tenant: { equals: tenantId } },
          ],
        },
        limit: 1,
      });

      if (found.docs.length > 0) {
        await payload.delete({
          collection: 'newsletterSubscriptions',
          id: found.docs[0].id,
        });
        removed++;
      }
    } catch (e) {
      console.error(`Error removing subscription ${row.email} @ ${row.miasto}:`, e);
      errors++;
    }
  }

  console.log(`Removed: ${removed}, errors: ${errors}`);
  console.log('Rollback completed (best-effort).');
}

const migration = { up, down };
export default migration;
