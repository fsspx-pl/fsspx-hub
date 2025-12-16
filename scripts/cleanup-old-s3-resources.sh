#!/bin/bash
set -e

# Configuration
OLD_BUCKET="${1:-fsspx-hub}"
OLD_POLICY_ARN="arn:aws:iam::593523140371:policy/PayloadCMS-S3-Storage"
ACCOUNT_ID="593523140371"

echo "🧹 Cleaning up old S3 resources..."
echo "Old bucket: ${OLD_BUCKET}"
echo "Old policy: ${OLD_POLICY_ARN}"
echo ""

# Check if old bucket exists
if ! aws s3 ls s3://${OLD_BUCKET} 2>/dev/null; then
  echo "⚠️  Old bucket ${OLD_BUCKET} does not exist, skipping..."
else
  echo "📦 Checking old bucket contents..."
  OLD_COUNT=$(aws s3 ls s3://${OLD_BUCKET} --recursive --summarize 2>/dev/null | grep "Total Objects" | awk '{print $3}')
  echo "   Found ${OLD_COUNT} objects in old bucket"
  
  read -p "⚠️  Delete old bucket ${OLD_BUCKET}? This cannot be undone! (yes/no): " confirm
  if [ "$confirm" = "yes" ]; then
    echo "🗑️  Emptying old bucket..."
    aws s3 rm s3://${OLD_BUCKET} --recursive
    
    echo "🗑️  Deleting old bucket..."
    aws s3 rb s3://${OLD_BUCKET}
    echo "✓ Old bucket deleted"
  else
    echo "⏭️  Skipping bucket deletion"
  fi
fi

echo ""
echo "📋 Checking old policy attachments..."

# Check if policy exists
if ! aws iam get-policy --policy-arn ${OLD_POLICY_ARN} 2>/dev/null; then
  echo "⚠️  Old policy does not exist, skipping..."
else
  # List all entities attached to the policy
  ATTACHED_USERS=$(aws iam list-entities-for-policy --policy-arn ${OLD_POLICY_ARN} --query "PolicyUsers[*].UserName" --output text 2>/dev/null || echo "")
  
  if [ -n "$ATTACHED_USERS" ] && [ "$ATTACHED_USERS" != "None" ]; then
    echo "⚠️  Policy is still attached to users: ${ATTACHED_USERS}"
    echo "   Detaching from users..."
    for user in $ATTACHED_USERS; do
      aws iam detach-user-policy --user-name "$user" --policy-arn ${OLD_POLICY_ARN} 2>/dev/null && echo "   ✓ Detached from ${user}" || echo "   ⚠️  Could not detach from ${user}"
    done
  else
    echo "✓ Policy is not attached to any users"
  fi
  
  read -p "🗑️  Delete old policy ${OLD_POLICY_ARN}? (yes/no): " confirm_policy
  if [ "$confirm_policy" = "yes" ]; then
    # Delete all policy versions first
    echo "   Deleting all policy versions..."
    VERSIONS=$(aws iam list-policy-versions --policy-arn ${OLD_POLICY_ARN} --query "Versions[?VersionId != 'v1'].VersionId" --output text 2>/dev/null || echo "")
    if [ -n "$VERSIONS" ]; then
      for version in $VERSIONS; do
        aws iam delete-policy-version --policy-arn ${OLD_POLICY_ARN} --version-id "$version" 2>/dev/null && echo "   ✓ Deleted version ${version}" || true
      done
    fi
    
    # Delete the policy
    aws iam delete-policy --policy-arn ${OLD_POLICY_ARN}
    echo "✓ Old policy deleted"
  else
    echo "⏭️  Skipping policy deletion"
  fi
fi

echo ""
echo "✨ Cleanup complete!"
