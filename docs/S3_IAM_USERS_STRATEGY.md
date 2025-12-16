# S3 IAM Users Strategy: Single vs. Separate Users

## Current Setup

You currently have one IAM user: `fsspx-storage` that has access to the original `fsspx-hub` bucket.

## Option 1: Single User (Simpler, Less Secure)

**Keep `fsspx-storage` user** and update its policy to access both buckets:
- ✅ Simpler to manage (one set of credentials)
- ✅ Easier to rotate keys
- ❌ Less secure (dev credentials could access prod if compromised)
- ❌ No separation of concerns

**Use Case**: Good for small teams or when dev/prod environments are similar.

## Option 2: Separate Users (More Secure, Recommended)

**Create two IAM users:**
- `fsspx-storage-dev` - Access only to `fsspx-hub-dev` bucket
- `fsspx-storage-prod` - Access only to `fsspx-hub-prod` bucket

**Benefits:**
- ✅ Better security isolation (dev credentials can't access prod)
- ✅ Principle of least privilege
- ✅ Easier to audit (separate access logs)
- ✅ Can rotate keys independently
- ✅ If dev credentials leak, prod is safe

**Trade-offs:**
- ❌ More complex (two sets of credentials to manage)
- ❌ Need to update environment variables per environment

## Recommendation

**For production applications, Option 2 (separate users) is recommended** because:
1. Security best practice (separation of environments)
2. Reduces blast radius if credentials are compromised
3. Better compliance with security standards

## Migration Path

### If choosing Option 2 (Separate Users):

1. **Rename existing user** (optional):
   ```bash
   # Option A: Rename to dev user
   aws iam update-user --user-name fsspx-storage --new-user-name fsspx-storage-dev
   
   # Option B: Keep as-is and create new prod user
   # (Keep fsspx-storage for dev, create fsspx-storage-prod for prod)
   ```

2. **Create production user**:
   ```bash
   aws iam create-user --user-name fsspx-storage-prod \
     --tags Key=Purpose,Value=S3Storage Key=Environment,Value=Production Key=Service,Value=PayloadCMS
   ```

3. **Create separate policies**:
   - `PayloadCMS-S3-Storage-Dev` - Access to `fsspx-hub-dev` only
   - `PayloadCMS-S3-Storage-Prod` - Access to `fsspx-hub-prod` only

4. **Attach policies**:
   ```bash
   aws iam attach-user-policy \
     --user-name fsspx-storage-dev \
     --policy-arn arn:aws:iam::ACCOUNT_ID:policy/PayloadCMS-S3-Storage-Dev
   
   aws iam attach-user-policy \
     --user-name fsspx-storage-prod \
     --policy-arn arn:aws:iam::ACCOUNT_ID:policy/PayloadCMS-S3-Storage-Prod
   ```

5. **Create access keys** for each user

6. **Update environment variables** per environment

### If choosing Option 1 (Single User):

1. Update the existing `fsspx-storage` user's policy to include both buckets
2. Keep using the same credentials in both environments
3. Update environment variables to point to the correct bucket per environment

## What to do with the existing `fsspx-storage` user?

**If choosing separate users:**
- **Option A**: Rename `fsspx-storage` → `fsspx-storage-dev` (keeps existing keys/access)
- **Option B**: Keep `fsspx-storage` as dev user, create new `fsspx-storage-prod` (simpler, no rename needed)

**Recommendation**: Option B (keep as-is, create new prod user) - simpler and less risk of breaking existing setup.
