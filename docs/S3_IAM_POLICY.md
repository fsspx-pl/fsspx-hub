# S3 IAM Policy for PayloadCMS Storage

This document provides the minimum IAM permissions required for PayloadCMS to use S3 storage, along with AWS CLI commands to set up the policy.

## Required Permissions

The IAM policy below grants the minimum permissions needed for PayloadCMS S3 storage operations:

- `s3:PutObject` - Upload files to S3
- `s3:GetObject` - Download files from S3 (for email attachments)
- `s3:DeleteObject` - Delete files from S3 (optional, for cleanup)
- `s3:ListBucket` - List objects in bucket (optional, for admin UI)

## IAM Policy JSON

## Single Bucket Policy (Original)

Save the following as `s3-payloadcms-policy.json` for a single bucket setup:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PayloadCMSMediaStorage",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR_BUCKET_NAME/media/*",
        "arn:aws:s3:::YOUR_BUCKET_NAME/uploads/*"
      ]
    },
    {
      "Sid": "PayloadCMSBucketList",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME",
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

**Important**: Replace `YOUR_BUCKET_NAME` with your actual S3 bucket name in both places.

## Multi-Bucket Policy (Dev + Prod)

If you're using separate buckets for development and production, use this policy:

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
        "arn:aws:s3:::YOUR_BUCKET_NAME-dev/media/*",
        "arn:aws:s3:::YOUR_BUCKET_NAME-dev/uploads/*",
        "arn:aws:s3:::YOUR_BUCKET_NAME-prod/media/*",
        "arn:aws:s3:::YOUR_BUCKET_NAME-prod/uploads/*"
      ]
    },
    {
      "Sid": "PayloadCMSBucketList",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR_BUCKET_NAME-dev",
        "arn:aws:s3:::YOUR_BUCKET_NAME-prod"
      ],
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

Replace `YOUR_BUCKET_NAME` with your base bucket name (e.g., `fsspx-hub`).

## AWS CLI Setup Commands

### 1. Create IAM Policy

```bash
# Replace YOUR_BUCKET_NAME with your actual bucket name
aws iam create-policy \
  --policy-name PayloadCMS-S3-Storage \
  --policy-document file://s3-payloadcms-policy.json \
  --description "Minimum permissions for PayloadCMS S3 storage operations"
```

This will output a policy ARN like: `arn:aws:iam::ACCOUNT_ID:policy/PayloadCMS-S3-Storage`

### 2. Create IAM Users for S3 Storage (Separate Dev/Prod)

For production applications, it's recommended to use separate IAM users for dev and prod environments. See `docs/S3_IAM_USERS_STRATEGY.md` for details.

**Quick setup with separate users:**

```bash
# Run the setup script (recommended)
bash scripts/setup-separate-iam-users.sh fsspx-hub <ACCOUNT_ID> eu-central-1

# Or manually create users:
# Dev user
aws iam create-user \
  --user-name fsspx-storage-dev \
  --tags Key=Purpose,Value=S3Storage Key=Environment,Value=Development Key=Service,Value=PayloadCMS

# Prod user  
aws iam create-user \
  --user-name fsspx-storage-prod \
  --tags Key=Purpose,Value=S3Storage Key=Environment,Value=Production Key=Service,Value=PayloadCMS
```

### 3. Create Access Keys for the IAM Users

Generate access keys for each user:

```bash
# Dev user
aws iam create-access-key --user-name fsspx-storage-dev

# Prod user
aws iam create-access-key --user-name fsspx-storage-prod
```

**Important**: Save the `AccessKeyId` and `SecretAccessKey` immediately - you won't be able to see the secret key again. Use these values for your environment variables:
- `S3_ACCESS_KEY_ID` = `AccessKeyId`
- `S3_SECRET_ACCESS_KEY` = `SecretAccessKey`

### 4. Attach Policy to IAM Role (Alternative)

If you're using an IAM role (e.g., for EC2, ECS, Lambda):

```bash
# Replace ACCOUNT_ID and ROLE_NAME with your values
aws iam attach-role-policy \
  --role-name YOUR_ROLE_NAME \
  --policy-arn arn:aws:iam::ACCOUNT_ID:policy/PayloadCMS-S3-Storage
```

### 5. Verify Permissions

To verify the policy is attached:

**For IAM Users:**
```bash
# Dev user
aws iam list-attached-user-policies --user-name fsspx-storage-dev

# Prod user
aws iam list-attached-user-policies --user-name fsspx-storage-prod
```

**For IAM Role:**
```bash
aws iam list-attached-role-policies --role-name YOUR_ROLE_NAME
```

### 6. Test S3 Access

Test that the credentials work:

```bash
# Test PutObject
aws s3 cp test-file.txt s3://YOUR_BUCKET_NAME/media/test-file.txt

# Test GetObject
aws s3 cp s3://YOUR_BUCKET_NAME/media/test-file.txt downloaded-file.txt

# Test ListBucket
aws s3 ls s3://YOUR_BUCKET_NAME/media/
```

## Environment Variables

After setting up the IAM users and policies, configure these environment variables in your application:

### Development Environment

```env
AWS_S3_BUCKET=fsspx-hub-dev
AWS_S3_ACCESS_KEY_ID=<dev-access-key-id>
AWS_S3_SECRET_ACCESS_KEY=<dev-secret-access-key>
AWS_REGION=eu-central-1
```

### Production Environment

```env
AWS_S3_BUCKET=fsspx-hub-prod
AWS_S3_ACCESS_KEY_ID=<prod-access-key-id>
AWS_S3_SECRET_ACCESS_KEY=<prod-secret-access-key>
AWS_REGION=eu-central-1
```

**Note**: 
- The environment variables use the `AWS_S3_*` prefix to clearly distinguish S3 storage credentials from other AWS services (like SES which uses `AWS_ACCESS_KEY_ID`).
- Use separate credentials for dev and prod environments for better security isolation.

## Security Best Practices

1. **Principle of Least Privilege**: The policy above grants only the minimum permissions needed. If you don't need delete operations, remove `s3:DeleteObject`.

2. **Bucket-Specific**: The policy is scoped to a specific bucket and the `media/` prefix. Adjust the resource ARN if your bucket structure differs.

3. **Separate Credentials**: Use dedicated IAM user/role credentials for PayloadCMS, not your root AWS account.

4. **Rotate Credentials**: Regularly rotate access keys for security.

5. **Monitor Usage**: Enable CloudTrail to monitor S3 API calls and detect any unauthorized access.

## Troubleshooting

### Access Denied Errors

If you get "Access Denied" errors:

1. Verify the policy is attached: `aws iam list-attached-user-policies --user-name fsspx-storage-dev` (or `fsspx-storage-prod`)
2. Check the bucket name matches in the policy JSON
3. Verify the credentials are correct in environment variables (use the access keys from step 3)
4. Ensure the IAM user has the policy attached (not just created)
5. Verify you're using the correct user credentials (`fsspx-storage-dev` for dev, `fsspx-storage-prod` for prod), not root account credentials

### Bucket Not Found

If you get "Bucket not found" errors:

1. Verify the bucket exists: `aws s3 ls`
2. Check the bucket name in `S3_BUCKET` environment variable
3. Ensure the bucket is in the correct region specified in `S3_REGION`
