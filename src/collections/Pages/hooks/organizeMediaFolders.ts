import { CollectionAfterChangeHook } from 'payload';
import { Page } from '@/payload-types';
import { extractMediaFromLexical } from './extractMediaFromLexical';
import { Media as MediaType } from '@/payload-types';

type MediaWithFolders = MediaType & { folders: string | null, prefix: string | null };

/**
 * Hook to organize media files into folder structure when page is published
 * Creates Media/Pages/<page-id> folder structure and moves media files there
 * Only runs when page transitions from draft to published
 */
export const organizeMediaFolders: CollectionAfterChangeHook<Page> = async ({
  doc,
  req,
  operation,
  previousDoc,
}) => {
  // Only run on create or update operations
  if (!['create', 'update'].includes(operation)) {
    return;
  }

  // Only reorganize when page transitions from draft to published
  const wasDraft = previousDoc?._status === 'draft' || !previousDoc?._status;
  const isPublished = doc._status === 'published';
  
  if (!wasDraft || !isPublished) {
    return;
  }

  // Extract media IDs from lexical editor content
  const content = doc.content;
  if (!content) {
    return;
  }

  const mediaIds = extractMediaFromLexical(content);
  if (mediaIds.length === 0) {
    return;
  }

  const pageId = doc.id;
  
  try {
    // Helper function to find or create a folder
    const findOrCreateFolder = async (
      name: string,
      parentId?: string | null
    ): Promise<string> => {
      // Search for existing folder
      const whereClause: any = {
        and: [
          { name: { equals: name } },
          { folderType: { contains: 'media' } },
        ],
      };

      if (parentId) {
        whereClause.and.push({ folder: { equals: parentId } });
      } else {
        whereClause.and.push({ folder: { exists: false } });
      }

      const existingFolders = await req.payload.find({
        collection: 'payload-folders',
        where: whereClause,
        limit: 1,
      });

      if (existingFolders.docs.length > 0) {
        return existingFolders.docs[0].id;
      }

      // Create new folder
      const newFolder = await req.payload.create({
        collection: 'payload-folders',
        data: {
          name,
          folder: parentId || null,
          folderType: ['media'],
        },
      });

      return newFolder.id;
    };

    // Create folder structure: Media → Pages → <page-id>
    const mediaFolderId = await findOrCreateFolder('Media');
    const pagesFolderId = await findOrCreateFolder('Pages', mediaFolderId);
    const pageFolderId = await findOrCreateFolder(pageId, pagesFolderId);

    req.payload.logger.info(
      `Created folder structure: Media/Pages/${pageId} (folder ID: ${pageFolderId})`
    );

    // Update each media document to point to the page folder
    for (const mediaId of mediaIds) {
      try {
        // Get current media document
        const media = await req.payload.findByID({
          collection: 'media',
          id: mediaId,
        }) as MediaWithFolders;

        // Set S3 prefix to uploads/posts/<page-id> (keep existing S3 path structure)
        const targetPrefix = `uploads/posts/${pageId}`;
        
        // Update folder and S3 prefix if different
        const needsUpdate = media.folders !== pageFolderId || media.prefix !== targetPrefix;
        
        if (needsUpdate) {
          await req.payload.update({
            collection: 'media',
            id: mediaId,
            data: {
              folder: pageFolderId,
              prefix: targetPrefix,
            },
          });

          req.payload.logger.info(
            `Organized Media ${mediaId}: folder Media/Pages/${pageId}, S3 prefix ${targetPrefix}`
          );
        }
      } catch (error) {
        req.payload.logger.warn(
          `Failed to organize Media ${mediaId}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  } catch (error) {
    req.payload.logger.error(
      `Failed to organize media folders for page ${pageId}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};
