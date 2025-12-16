# S3 Bucket Migration Guide

This guide helps you migrate from a single S3 bucket to separate development and production buckets.

## Overview

Since AWS S3 doesn't support renaming buckets directly, we need to:
1. Create a new bucket with `-dev` suffix
2. Copy all objects from the current bucket to the new `-dev` bucket
3. Create a new production bucket (with the original name)
4. Update environment variables accordingly

## Prerequisites

- AWS CLI configured with appropriate credentials
- Current bucket name (e.g., `fsspx-hub`)
- Target region (e.g., `eu-central-1`)

## Step 1: Create Development Bucket

```bash
# Set your variables
CURRENT_BUCKET="fsspx-hub"
DEV_BUCKET="${CURRENT_BUCKET}-dev"
PROD_BUCKET="${CURRENT_BUCKET}-prod"
REGION="eu-central-1"

# Create the development bucket
aws s3 mb s3://${DEV_BUCKET} --region ${REGION}
```

## Step 2: Copy All Objects to Development Bucket

```bash
# Copy all objects from current bucket to dev bucket
aws s3 sync s3://${CURRENT_BUCKET} s3://${DEV_BUCKET} --region ${REGION}

# Verify the copy
aws s3 ls s3://${DEV_BUCKET} --recursive --summarize
```

## Step 3: Create Production Bucket

```bash
# Create the production bucket (with original name)
aws s3 mb s3://${PROD_BUCKET} --region ${REGION}
```

## Step 4: Update IAM Policy

Update your IAM policy to allow access to both buckets. The policy should include:

```json
{
  "Version": "2012-01-01",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::${CURRENT_BUCKET}-dev/media/*",
        "arn:aws:s3:::${CURRENT_BUCKET}-dev/uploads/*",
        "arn:aws:s3:::${CURRENT_BUCKET}-prod/media/*",
        "arn:aws:s3:::${CURRENT_BUCKET}-prod/uploads/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": [
        "arn:aws:s3:::${CURRENT_BUCKET}-dev",
        "arn:aws:s3:::${CURRENT_BUCKET}-prod"
      ]
    }
  ]
}
```

## Step 5: Update Environment Variables

### Development Environment
```bash
AWS_S3_BUCKET=fsspx-hub-dev
AWS_REGION=eu-central-1
```

### Production Environment
```bash
AWS_S3_BUCKET=fsspx-hub-prod
AWS_REGION=eu-central-1
```

## Step 6: Verify Migration

```bash
# Check dev bucket contents
aws s3 ls s3://${DEV_BUCKET}/media/ --recursive

# Check prod bucket (should be empty initially)
aws s3 ls s3://${PROD_BUCKET}/media/ --recursive
```

## Step 7: (Optional) Delete Old Bucket

**⚠️ WARNING: Only do this after verifying everything works!**

```bash
# First, empty the old bucket
aws s3 rm s3://${CURRENT_BUCKET} --recursive

# Then delete the bucket
aws s3 rb s3://${CURRENT_BUCKET}
```

## Migration Script

You can also use this script to automate the process:

```bash
#!/bin/bash
set -e

CURRENT_BUCKET="fsspx-hub"
DEV_BUCKET="${CURRENT_BUCKET}-dev"
PROD_BUCKET="${CURRENT_BUCKET}-prod"
REGION="eu-central-1"

echo "Creating development bucket: ${DEV_BUCKET}"
aws s3 mb s3://${DEV_BUCKET} --region ${REGION}

echo "Copying objects to development bucket..."
aws s3 sync s3://${CURRENT_BUCKET} s3://${DEV_BUCKET} --region ${REGION}

echo "Creating production bucket: ${PROD_BUCKET}"
aws s3 mb s3://${PROD_BUCKET} --region ${REGION}

echo "Migration complete!"
echo "Update your environment variables:"
echo "  Development: AWS_S3_BUCKET=${DEV_BUCKET}"
echo "  Production: AWS_S3_BUCKET=${PROD_BUCKET}"
```

## Notes

- The migration preserves all existing files in the development bucket
- Production bucket starts empty and will be populated as new media is uploaded
- Use separate IAM users for each environment (`fsspx-storage-dev` and `fsspx-storage-prod`) - see `docs/S3_IAM_USERS_STRATEGY.md`
- Make sure to update your IAM policy to allow access to both buckets before switching environments
