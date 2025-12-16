import { CollectionBeforeChangeHook } from 'payload';
import { Page } from '@/payload-types';

export const validateAttachmentsArePDF: CollectionBeforeChangeHook<Page> = async ({
  data,
  req,
  operation,
}) => {
  if (!data.attachment || (Array.isArray(data.attachment) && data.attachment.length === 0)) {
    return data; // Optional field, no validation needed
  }

  const attachments = Array.isArray(data.attachment) ? data.attachment : [data.attachment];

  for (const attachment of attachments) {
    const mediaId = typeof attachment === 'string' ? attachment : attachment.id;
    
    try {
      const media = await req.payload.findByID({
        collection: 'media',
        id: mediaId,
      });

      if (media.mimeType && !media.mimeType.includes('application/pdf')) {
        throw new Error(`Tylko pliki PDF są dozwolone jako załączniki. Plik "${media.filename || mediaId}" ma typ MIME: ${media.mimeType}`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Tylko pliki PDF')) {
        throw error;
      }
      // If media not found, let it fail naturally
      req.payload.logger.warn(`Could not validate attachment ${mediaId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return data;
};
