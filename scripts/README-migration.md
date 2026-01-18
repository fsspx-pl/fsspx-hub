# Announcements Migration Scripts

## Problem

If the `announcements` collection is empty but data exists in the old `pages` collection, the frontend will not display announcements correctly.

## Solution

### Step 1: Check the current state

Run the diagnostic script to see what collections exist and their document counts:

```bash
pnpm check:announcements
```

This will show:
- Which collections exist (`pages`, `pages_versions`, `announcements`, `announcements_versions`)
- Document counts for each collection
- Recommendations for fixing the issue

### Step 2: Run the migration

If the diagnostic shows that `pages` has data but `announcements` is empty, run the migration:

```bash
pnpm migrate:announcements
```

This script will:
- Copy all documents from `pages` to `announcements` (upsert by `_id`)
- Copy all version documents from `pages_versions` to `announcements_versions`
- Verify the migration via Payload API

### Step 3: Verify

After running the migration, check again:

```bash
pnpm check:announcements
```

You should see that `announcements` now has the same number of documents as `pages` had.

## Alternative: Use Payload Migrations

The recovery migration (`2026-01-15-recover-announcements-from-pages.ts`) should run automatically when you start the application. If it hasn't run, you can trigger it manually:

```bash
pnpm payload migrate
```

This will run all pending migrations, including the recovery migration.

## Notes

- The migration scripts are non-destructive - they use `upsert` operations, so existing data in `announcements` won't be lost
- The scripts work directly with MongoDB collections, so they're faster than using Payload API
- After migration, you can safely delete the old `pages` and `pages_versions` collections if desired (but the migration scripts don't do this automatically)
