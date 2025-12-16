import { CollectionAfterChangeHook } from 'payload';
import { Page } from '@/payload-types';

/**
 * Hook to update Media document prefixes for page attachments
 * Sets prefix to uploads/posts/{pageId} for all attachments linked to this page
 */
export const setAttachmentPrefix: CollectionAfterChangeHook<Page> = async ({
  doc,
  req,
  operation,
  previousDoc,
}) => {
  // Only run on create or update operations
  if (!['create', 'update'].includes(operation)) {
    return;
  }

  // Get attachments from the current document
  const attachments = doc.attachment;
  if (!attachments || (Array.isArray(attachments) && attachments.length === 0)) {
    return;
  }

  const pageId = doc.id;
  const attachmentIds = Array.isArray(attachments) ? attachments : [attachments];
  
  // Set prefix for each attachment: uploads/posts/{pageId}
  const targetPrefix = `uploads/posts/${pageId}`;

  for (const attachment of attachmentIds) {
    const mediaId = typeof attachment === 'string' ? attachment : attachment.id;
    
    try {
      // Get current media document
      const media = await req.payload.findByID({
        collection: 'media',
        id: mediaId,
      });

      // Update prefix if it's different
      if (media.prefix !== targetPrefix) {
        await req.payload.update({
          collection: 'media',
          id: mediaId,
          data: {
            prefix: targetPrefix,
          },
        });
        
        req.payload.logger.info(`Updated Media ${mediaId} prefix to ${targetPrefix}`);
      }
    } catch (error) {
      req.payload.logger.warn(
        `Failed to update prefix for Media ${mediaId}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
};
