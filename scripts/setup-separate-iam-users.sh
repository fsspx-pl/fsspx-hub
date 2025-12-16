#!/bin/bash
set -e

# Configuration
BUCKET_BASE_NAME="${1:-fsspx-hub}"
ACCOUNT_ID="${2}"
REGION="${3:-eu-central-1}"

if [ -z "$ACCOUNT_ID" ]; then
  echo "❌ Error: AWS Account ID is required"
  echo "Usage: $0 <bucket-base-name> <aws-account-id> [region]"
  echo "Example: $0 fsspx-hub 593523140371 eu-central-1"
  exit 1
fi

DEV_BUCKET="${BUCKET_BASE_NAME}-dev"
PROD_BUCKET="${BUCKET_BASE_NAME}-prod"
DEV_USER="fsspx-storage-dev"
PROD_USER="fsspx-storage-prod"

echo "🚀 Setting up separate IAM users for dev and prod buckets"
echo "Account ID: ${ACCOUNT_ID}"
echo "Dev bucket: ${DEV_BUCKET}"
echo "Prod bucket: ${PROD_BUCKET}"
echo "Dev user: ${DEV_USER}"
echo "Prod user: ${PROD_USER}"
echo ""

# Create Dev Policy
echo "📝 Creating Dev policy..."
cat > /tmp/s3-dev-policy.json <<EOF
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
        "arn:aws:s3:::${DEV_BUCKET}/media/*",
        "arn:aws:s3:::${DEV_BUCKET}/uploads/*"
      ]
    },
    {
      "Sid": "PayloadCMSBucketListDev",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::${DEV_BUCKET}",
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
EOF

aws iam create-policy \
  --policy-name PayloadCMS-S3-Storage-Dev \
  --policy-document file:///tmp/s3-dev-policy.json \
  --description "Dev environment S3 storage permissions for PayloadCMS" \
  2>/dev/null && echo "✓ Dev policy created" || echo "⚠️  Dev policy may already exist"

# Create Prod Policy
echo "📝 Creating Prod policy..."
cat > /tmp/s3-prod-policy.json <<EOF
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
        "arn:aws:s3:::${PROD_BUCKET}/media/*",
        "arn:aws:s3:::${PROD_BUCKET}/uploads/*"
      ]
    },
    {
      "Sid": "PayloadCMSBucketListProd",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::${PROD_BUCKET}",
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
EOF

aws iam create-policy \
  --policy-name PayloadCMS-S3-Storage-Prod \
  --policy-document file:///tmp/s3-prod-policy.json \
  --description "Prod environment S3 storage permissions for PayloadCMS" \
  2>/dev/null && echo "✓ Prod policy created" || echo "⚠️  Prod policy may already exist"

# Create Dev User (rename existing fsspx-storage if it exists)
echo ""
echo "👤 Setting up Dev user..."
if aws iam get-user --user-name ${DEV_USER} 2>/dev/null; then
  echo "⚠️  User ${DEV_USER} already exists, skipping creation"
else
  # Check if fsspx-storage exists - rename it to fsspx-storage-dev
  if aws iam get-user --user-name fsspx-storage 2>/dev/null; then
    echo "📝 Renaming existing 'fsspx-storage' to ${DEV_USER}..."
    aws iam update-user --user-name fsspx-storage --new-user-name ${DEV_USER}
    echo "✓ Renamed fsspx-storage to ${DEV_USER}"
  else
    aws iam create-user \
      --user-name ${DEV_USER} \
      --tags Key=Purpose,Value=S3Storage Key=Environment,Value=Development Key=Service,Value=PayloadCMS
    echo "✓ Created ${DEV_USER}"
  fi
fi

# Attach Dev Policy
DEV_POLICY_ARN="arn:aws:iam::${ACCOUNT_ID}:policy/PayloadCMS-S3-Storage-Dev"
aws iam attach-user-policy \
  --user-name ${DEV_USER} \
  --policy-arn ${DEV_POLICY_ARN} \
  2>/dev/null && echo "✓ Attached dev policy to ${DEV_USER}" || echo "⚠️  Policy may already be attached"

# Create Prod User
echo ""
echo "👤 Creating Prod user..."
if aws iam get-user --user-name ${PROD_USER} 2>/dev/null; then
  echo "⚠️  User ${PROD_USER} already exists, skipping creation"
else
  aws iam create-user \
    --user-name ${PROD_USER} \
    --tags Key=Purpose,Value=S3Storage Key=Environment,Value=Production Key=Service,Value=PayloadCMS
  echo "✓ Created ${PROD_USER}"
fi

# Attach Prod Policy
PROD_POLICY_ARN="arn:aws:iam::${ACCOUNT_ID}:policy/PayloadCMS-S3-Storage-Prod"
aws iam attach-user-policy \
  --user-name ${PROD_USER} \
  --policy-arn ${PROD_POLICY_ARN} \
  2>/dev/null && echo "✓ Attached prod policy to ${PROD_USER}" || echo "⚠️  Policy may already be attached"

# Create Access Keys
echo ""
echo "🔑 Creating access keys..."
echo ""
echo "=== DEV USER ACCESS KEYS ==="
aws iam create-access-key --user-name ${DEV_USER} --output json | jq -r '.AccessKey | "AccessKeyId: \(.AccessKeyId)\nSecretAccessKey: \(.SecretAccessKey)"'
echo ""
echo "=== PROD USER ACCESS KEYS ==="
aws iam create-access-key --user-name ${PROD_USER} --output json | jq -r '.AccessKey | "AccessKeyId: \(.AccessKeyId)\nSecretAccessKey: \(.SecretAccessKey)"'

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Save the access keys securely"
echo "2. Update environment variables:"
echo "   Development:"
echo "     AWS_S3_BUCKET=${DEV_BUCKET}"
echo "     AWS_S3_ACCESS_KEY_ID=<dev-access-key-id>"
echo "     AWS_S3_SECRET_ACCESS_KEY=<dev-secret-access-key>"
echo "     AWS_REGION=${REGION}"
echo ""
echo "   Production:"
echo "     AWS_S3_BUCKET=${PROD_BUCKET}"
echo "     AWS_S3_ACCESS_KEY_ID=<prod-access-key-id>"
echo "     AWS_S3_SECRET_ACCESS_KEY=<prod-secret-access-key>"
echo "     AWS_REGION=${REGION}"
