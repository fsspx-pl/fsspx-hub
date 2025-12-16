#!/bin/bash
set -e

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION="eu-central-1"

echo "🚀 Setting up separate IAM users for dev and prod S3 buckets..."
echo "AWS Account ID: ${ACCOUNT_ID}"
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Create policies
echo "📝 Creating IAM policies..."
aws iam create-policy \
  --policy-name PayloadCMS-S3-Storage-Dev \
  --policy-document file://${PROJECT_ROOT}/s3-payloadcms-policy-dev.json \
  --description "Development S3 storage permissions for PayloadCMS" \
  2>/dev/null || echo "⚠️  Dev policy may already exist"

aws iam create-policy \
  --policy-name PayloadCMS-S3-Storage-Prod \
  --policy-document file://${PROJECT_ROOT}/s3-payloadcms-policy-prod.json \
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
  --policy-arn arn:aws:iam::${ACCOUNT_ID}:policy/PayloadCMS-S3-Storage-Dev \
  2>/dev/null || echo "⚠️  Policy may already be attached"

aws iam attach-user-policy \
  --user-name fsspx-storage-prod \
  --policy-arn arn:aws:iam::${ACCOUNT_ID}:policy/PayloadCMS-S3-Storage-Prod \
  2>/dev/null || echo "⚠️  Policy may already be attached"

# Create access keys
echo ""
echo "🔑 Creating access keys..."
echo ""
echo "=== Development User Access Keys ==="
aws iam create-access-key --user-name fsspx-storage-dev 2>/dev/null || echo "⚠️  Access keys may already exist. Use 'aws iam list-access-keys --user-name fsspx-storage-dev' to view existing keys."

echo ""
echo "=== Production User Access Keys ==="
aws iam create-access-key --user-name fsspx-storage-prod 2>/dev/null || echo "⚠️  Access keys may already exist. Use 'aws iam list-access-keys --user-name fsspx-storage-prod' to view existing keys."

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Save the access keys securely"
echo "2. Update your environment variables:"
echo "   Development: AWS_S3_BUCKET=fsspx-hub-dev"
echo "   Production: AWS_S3_BUCKET=fsspx-hub-prod"
echo "3. Test access to ensure everything works"
