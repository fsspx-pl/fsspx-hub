# Cloudflare Deployment Guide

This guide explains how to deploy this PayloadCMS application to Cloudflare Pages with D1 database.

## Prerequisites

1. Cloudflare account
2. Wrangler CLI installed: `npm install -g wrangler` or `pnpm add -g wrangler`
3. Cloudflare account authenticated: `wrangler login`

## Setup Steps

### 1. Create D1 Database

Create a D1 database in your Cloudflare account:

```bash
wrangler d1 create fsspx-hub-db
```

This will output a database ID. Update `wrangler.toml` with the `database_id`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "fsspx-hub-db"
database_id = "YOUR_DATABASE_ID_HERE"
```

### 2. Run Migrations

Run PayloadCMS migrations to set up your database schema:

```bash
# For local development
wrangler d1 execute fsspx-hub-db --local --command="SELECT 1" # Test connection
pnpm payload migrate

# For production (after deployment)
wrangler d1 execute fsspx-hub-db --remote --command="SELECT 1"
```

### 3. Set Environment Variables

Set the following environment variables in Cloudflare Pages dashboard:

- `PAYLOAD_SECRET` - Your PayloadCMS secret
- `NEXT_PUBLIC_ROOT_DOMAIN` - Your domain
- `NEXT_PUBLIC_IS_LIVE` - Set to `true` for production
- `AWS_REGION` - AWS region for S3 storage
- `AWS_S3_BUCKET` - S3 bucket name
- `AWS_S3_ACCESS_KEY_ID` - S3 access key
- `AWS_S3_SECRET_ACCESS_KEY` - S3 secret key
- `FROM_ADDRESS` - Email from address
- `FROM_NAME` - Email from name
- `SMTP_HOST` - SMTP host
- `SMTP_PORT` - SMTP port
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `POSTHOG_ERROR_TRACKING_APIKEY` - PostHog API key (optional)
- `POSTHOG_ENV_ID` - PostHog environment ID (optional)
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog public key (optional)
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog host (optional)
- `POSTHOG_UPLOAD_SOURCEMAPS` - Set to `true` to upload sourcemaps (optional)
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` - Cloudflare Turnstile site key (optional)
- `TURNSTILE_SECRET_KEY` - Cloudflare Turnstile secret key (optional)

### 4. Build Configuration

The project is configured to work with Cloudflare Pages. The build output is set in `next.config.mjs`.

### 5. Deploy to Cloudflare Pages

#### Option A: Deploy via Wrangler CLI

```bash
# Build the project
pnpm build

# Deploy to Cloudflare Pages
pnpm deploy
```

#### Option B: Deploy via GitHub Actions

Connect your repository to Cloudflare Pages:

1. Go to Cloudflare Dashboard > Pages
2. Create a new project
3. Connect your Git repository
4. Set build command: `pnpm ci`
5. Set build output directory: `.next`
6. Add environment variables in the dashboard

### 6. Local Development with Cloudflare

To test locally with Cloudflare D1:

```bash
# Start local D1 database
wrangler d1 execute fsspx-hub-db --local

# Run development server with Cloudflare bindings
pnpm dev:cloudflare
```

## Important Notes

1. **Database Migration**: Always run migrations after creating the database or when schema changes occur.

2. **D1 Limitations**: D1 is SQLite-based and has some limitations compared to MongoDB:
   - No transactions across multiple statements in some cases
   - Different data types
   - PayloadCMS will handle the migration automatically

3. **Storage**: Media files are still stored in S3. Ensure your S3 credentials are properly configured.

4. **Email**: Email functionality uses Nodemailer. Ensure SMTP credentials are set correctly.

5. **Build Output**: The project uses Next.js standalone output for Cloudflare Pages compatibility.

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Verify the D1 database binding name matches in `wrangler.toml` (should be `DB`)
2. Check that the database ID is correct in `wrangler.toml`
3. Ensure migrations have been run

### Build Failures

If the build fails:

1. Check that all environment variables are set
2. Verify Node.js version compatibility (check `.nvmrc`)
3. Ensure all dependencies are installed (`pnpm install`)

### Runtime Errors

If you see runtime errors:

1. Check Cloudflare Pages function logs
2. Verify all environment variables are set in the Cloudflare dashboard
3. Ensure the D1 database binding is correctly configured

## Migration from MongoDB

If migrating from MongoDB:

1. Export your data from MongoDB
2. The schema will be automatically created by PayloadCMS migrations
3. You may need to write custom migration scripts to transform data formats
4. Test thoroughly in a staging environment before production deployment
