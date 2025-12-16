#!/bin/bash
set -e

# Configuration
CURRENT_BUCKET="${1:-fsspx-hub}"
DEV_BUCKET="${CURRENT_BUCKET}-dev"
PROD_BUCKET="${CURRENT_BUCKET}-prod"
REGION="${2:-eu-central-1}"

echo "🚀 Starting S3 bucket migration..."
echo "Current bucket: ${CURRENT_BUCKET}"
echo "Dev bucket: ${DEV_BUCKET}"
echo "Prod bucket: ${PROD_BUCKET}"
echo "Region: ${REGION}"
echo ""

# Check if current bucket exists
if ! aws s3 ls s3://${CURRENT_BUCKET} 2>/dev/null; then
  echo "❌ Error: Current bucket ${CURRENT_BUCKET} does not exist or is not accessible"
  exit 1
fi

# Create dev bucket
echo "📦 Creating development bucket: ${DEV_BUCKET}"
if aws s3 mb s3://${DEV_BUCKET} --region ${REGION} 2>/dev/null; then
  echo "✓ Development bucket created"
else
  echo "⚠️  Development bucket may already exist, continuing..."
fi

# Copy all objects to dev bucket
echo "📤 Copying objects to development bucket..."
aws s3 sync s3://${CURRENT_BUCKET} s3://${DEV_BUCKET} --region ${REGION}

# Verify copy
DEV_COUNT=$(aws s3 ls s3://${DEV_BUCKET} --recursive --summarize 2>/dev/null | grep "Total Objects" | awk '{print $3}')
echo "✓ Copied ${DEV_COUNT} objects to development bucket"

# Create prod bucket
echo "📦 Creating production bucket: ${PROD_BUCKET}"
if aws s3 mb s3://${PROD_BUCKET} --region ${REGION} 2>/dev/null; then
  echo "✓ Production bucket created"
else
  echo "⚠️  Production bucket may already exist, continuing..."
fi

echo ""
echo "✨ Migration complete!"
echo ""
echo "Next steps:"
echo "1. Update IAM policy to allow access to both buckets (see docs/S3_IAM_POLICY.md)"
echo "2. Update environment variables:"
echo "   Development: AWS_S3_BUCKET=${DEV_BUCKET}"
echo "   Production: AWS_S3_BUCKET=${PROD_BUCKET}"
echo "3. Test the application with the new bucket names"
