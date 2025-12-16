# S3 IAM Setup Guide - Separate Dev and Prod Users

This guide sets up separate IAM users for development and production S3 buckets, following security best practices.

## Overview

- **Development User**: `fsspx-storage-dev` - Access only to `fsspx-hub-dev` bucket
- **Production User**: `fsspx-storage-prod` - Access only to `fsspx-hub-prod` bucket

This separation ensures:
- Production credentials cannot accidentally be used in development
- If dev credentials are compromised, production is not affected
- Clear audit trail of which environment is accessing which bucket

## Step 1: Create IAM Policies

### Development Policy

Save as `s3-payloadcms-policy-dev.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PayloadCMSMediaStorageDev",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::fsspx-hub-dev/media/*",
        "arn:aws:s3:::fsspx-hub-dev/uploads/*"
      ]
    },
    {
      "Sid": "PayloadCMSBucketListDev",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::fsspx-hub-dev",
      "Condition": {
        "StringLike": {
          "s3:prefix": [
            "media/*",
            "uploads/*"
          ]
        }
      }
    }
  ]
}
```

### Production Policy

Save as `s3-payloadcms-policy-prod.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PayloadCMSMediaStorageProd",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::fsspx-hub-prod/media/*",
        "arn:aws:s3:::fsspx-hub-prod/uploads/*"
      ]
    },
    {
      "Sid": "PayloadCMSBucketListProd",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::fsspx-hub-prod",
      "Condition": {
        "StringLike": {
          "s3:prefix": [
            "media/*",
            "uploads/*"
          ]
        }
      }
    }
  ]
}
```

## Step 2: Create IAM Policies in AWS

```bash
# Create development policy
aws iam create-policy \
  --policy-name PayloadCMS-S3-Storage-Dev \
  --policy-document file://s3-payloadcms-policy-dev.json \
  --description "Development S3 storage permissions for PayloadCMS"

# Create production policy
aws iam create-policy \
  --policy-name PayloadCMS-S3-Storage-Prod \
  --policy-document file://s3-payloadcms-policy-prod.json \
  --description "Production S3 storage permissions for PayloadCMS"
```

Note the Policy ARNs from the output (you'll need them in the next step).

## Step 3: Create IAM Users

```bash
# Create development user
aws iam create-user \
  --user-name fsspx-storage-dev \
  --tags Key=Purpose,Value=S3Storage Key=Environment,Value=Development Key=Service,Value=PayloadCMS

# Create production user
aws iam create-user \
  --user-name fsspx-storage-prod \
  --tags Key=Purpose,Value=S3Storage Key=Environment,Value=Production Key=Service,Value=PayloadCMS
```

## Step 4: Attach Policies to Users

Replace `ACCOUNT_ID` with your AWS account ID:

```bash
# Attach dev policy to dev user
aws iam attach-user-policy \
  --user-name fsspx-storage-dev \
  --policy-arn arn:aws:iam::ACCOUNT_ID:policy/PayloadCMS-S3-Storage-Dev

# Attach prod policy to prod user
aws iam attach-user-policy \
  --user-name fsspx-storage-prod \
  --policy-arn arn:aws:iam::ACCOUNT_ID:policy/PayloadCMS-S3-Storage-Prod
```

## Step 5: Create Access Keys

```bash
# Create access keys for development user
aws iam create-access-key --user-name fsspx-storage-dev

# Create access keys for production user
aws iam create-access-key --user-name fsspx-storage-prod
```

**Important**: Save the `AccessKeyId` and `SecretAccessKey` for each user immediately - you won't be able to see the secret keys again.

## Step 6: Update Environment Variables

### Development Environment

```bash
AWS_S3_BUCKET=fsspx-hub-dev
AWS_S3_ACCESS_KEY_ID=<dev-access-key-id>
AWS_S3_SECRET_ACCESS_KEY=<dev-secret-access-key>
AWS_REGION=eu-central-1
```

### Production Environment

```bash
AWS_S3_BUCKET=fsspx-hub-prod
AWS_S3_ACCESS_KEY_ID=<prod-access-key-id>
AWS_S3_SECRET_ACCESS_KEY=<prod-secret-access-key>
AWS_REGION=eu-central-1
```

## Step 7: Verify Setup

### Test Development Access

```bash
# Set dev credentials temporarily
export AWS_ACCESS_KEY_ID=<dev-access-key-id>
export AWS_SECRET_ACCESS_KEY=<dev-secret-access-key>

# Test dev bucket access
aws s3 ls s3://fsspx-hub-dev/media/

# Test prod bucket access (should fail)
aws s3 ls s3://fsspx-hub-prod/media/ || echo "Expected: Access Denied"
```

### Test Production Access

```bash
# Set prod credentials temporarily
export AWS_ACCESS_KEY_ID=<prod-access-key-id>
export AWS_SECRET_ACCESS_KEY=<prod-secret-access-key>

# Test prod bucket access
aws s3 ls s3://fsspx-hub-prod/media/

# Test dev bucket access (should fail)
aws s3 ls s3://fsspx-hub-dev/media/ || echo "Expected: Access Denied"
```

## Automated Setup Script

Save as `scripts/setup-s3-iam-users.sh`:

```bash
#!/bin/bash
set -e

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION="eu-central-1"

echo "🚀 Setting up separate IAM users for dev and prod S3 buckets..."
echo "AWS Account ID: ${ACCOUNT_ID}"
echo ""

# Create policies
echo "📝 Creating IAM policies..."
aws iam create-policy \
  --policy-name PayloadCMS-S3-Storage-Dev \
  --policy-document file://s3-payloadcms-policy-dev.json \
  --description "Development S3 storage permissions for PayloadCMS" \
  2>/dev/null || echo "⚠️  Dev policy may already exist"

aws iam create-policy \
  --policy-name PayloadCMS-S3-Storage-Prod \
  --policy-document file://s3-payloadcms-policy-prod.json \
  --description "Production S3 storage permissions for PayloadCMS" \
  2>/dev/null || echo "⚠️  Prod policy may already exist"

# Create users
echo "👤 Creating IAM users..."
aws iam create-user \
  --user-name fsspx-storage-dev \
  --tags Key=Purpose,Value=S3Storage Key=Environment,Value=Development Key=Service,Value=PayloadCMS \
  2>/dev/null || echo "⚠️  Dev user may already exist"

aws iam create-user \
  --user-name fsspx-storage-prod \
  --tags Key=Purpose,Value=S3Storage Key=Environment,Value=Production Key=Service,Value=PayloadCMS \
  2>/dev/null || echo "⚠️  Prod user may already exist"

# Attach policies
echo "🔗 Attaching policies to users..."
aws iam attach-user-policy \
  --user-name fsspx-storage-dev \
  --policy-arn arn:aws:iam::${ACCOUNT_ID}:policy/PayloadCMS-S3-Storage-Dev

aws iam attach-user-policy \
  --user-name fsspx-storage-prod \
  --policy-arn arn:aws:iam::${ACCOUNT_ID}:policy/PayloadCMS-S3-Storage-Prod

# Create access keys
echo "🔑 Creating access keys..."
echo ""
echo "=== Development User Access Keys ==="
aws iam create-access-key --user-name fsspx-storage-dev

echo ""
echo "=== Production User Access Keys ==="
aws iam create-access-key --user-name fsspx-storage-prod

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Save the access keys securely"
echo "2. Update your environment variables with the appropriate credentials"
echo "3. Test access to ensure everything works"
```

## Security Benefits

1. **Isolation**: Dev and prod credentials are completely separate
2. **Least Privilege**: Each user only has access to their respective bucket
3. **Audit Trail**: Clear separation in CloudTrail logs
4. **Risk Mitigation**: Compromised dev credentials don't affect production
5. **Compliance**: Better alignment with security best practices

## Migration from Single User

If you're migrating from a single user setup:

1. Create the new users and policies (as above)
2. Update environment variables in your deployment environments
3. Test thoroughly
4. Optionally, disable or delete the old `fsspx-storage` user's access keys
5. Keep the old user for a grace period, then delete it
