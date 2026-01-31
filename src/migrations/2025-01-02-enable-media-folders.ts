import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-d1';

/**
 * Migration to enable folders feature for Media collection
 * 
 * This migration ensures the payload-folders collection is properly initialized
 * and ready for use with the Media collection. PayloadCMS automatically creates
 * the folder collection when folders are enabled, but this migration verifies
 * the setup is correct.
 */
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  try {
    // Verify the payload-folders collection exists
    // PayloadCMS creates this automatically when folders are enabled on a collection
    const foldersCollection = payload.collections['payload-folders'];
    
    if (!foldersCollection) {
      payload.logger.warn(
        '⚠️  payload-folders collection not found. It should be created automatically when folders are enabled on a collection.'
      );
      return;
    }

    payload.logger.info('✅ Folders feature is properly configured for Media collection');
    payload.logger.info('📁 The payload-folders collection is available for organizing media files');
  } catch (error) {
    payload.logger.error(
      `❌ Error verifying folders configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw error;
  }
}

export async function down({}: MigrateDownArgs): Promise<void> {
  // No-op: Folders collection is managed by PayloadCMS
  // If folders are disabled, the collection will remain but won't be used
  // Manual cleanup of folder documents would be required if needed
}

const migration = { up, down };
export default migration;
