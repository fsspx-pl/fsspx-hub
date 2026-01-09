import { Media, Page } from '@/payload-types';
import { extractMediaFromLexical } from '@/collections/Pages/hooks/extractMediaFromLexical';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

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
