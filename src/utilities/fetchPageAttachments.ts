import { Media, Page } from '@/payload-types';
import { extractMediaFromLexical } from '@/collections/Pages/hooks/extractMediaFromLexical';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { getMediaAsEmailAttachment } from './s3Download';

interface AttachmentResult {
  attachments: Media[];
  attachmentDisplay: Page['attachmentDisplay'];
}

/**
 * Extracts and fetches media attachments from a page's lexical content.
 * Also returns the attachment display settings with defaults.
 */
export async function fetchPageAttachments(page: Page): Promise<AttachmentResult> {
  const mediaIds = page.content ? extractMediaFromLexical(page.content) : [];
  
  let attachments: Media[] = [];
  if (mediaIds.length > 0) {
    const payload = await getPayload({ config: configPromise });
    try {
      const mediaResults = await Promise.all(
        mediaIds.map(async (id) => {
          try {
            return await payload.findByID({ collection: 'media', id });
          } catch {
            return null;
          }
        })
      );
      attachments = mediaResults.filter((m): m is Media => m !== null);
    } catch (error) {
      console.error('Failed to fetch attachments:', error);
    }
  }

  const attachmentDisplay = page.attachmentDisplay || {
    displayMode: 'collect-bottom' as const,
    showTopAlert: false,
  };

  return { attachments, attachmentDisplay };
}

export type EmailAttachment = { filename: string; content: Buffer; contentType?: string };

/**
 * Downloads media files from S3 and prepares them as email attachments.
 * Errors are handled gracefully - missing files are skipped.
 */
export async function prepareEmailAttachments(
  mediaList: Media[],
  pageId: string
): Promise<EmailAttachment[]> {
  if (mediaList.length === 0) return [];

  const results = await Promise.all(
    mediaList.map(async (media) => {
      try {
        return await getMediaAsEmailAttachment(media, pageId);
      } catch (error: any) {
        const isNotFound = error?.message?.includes('not found') || error?.message?.includes('NoSuchKey');
        if (!isNotFound) {
          console.error(`Failed to download attachment ${media.id} from S3:`, error);
        }
        return null;
      }
    })
  );

  return results.filter((att): att is EmailAttachment => att !== null);
}
