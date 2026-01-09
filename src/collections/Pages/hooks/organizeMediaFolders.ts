import { CollectionAfterChangeHook } from 'payload';
import { Page, Tenant } from '@/payload-types';
import { extractMediaFromLexical } from './extractMediaFromLexical';
import { Media as MediaType } from '@/payload-types';
import { format, parseISO } from 'date-fns';

type MediaWithFolders = MediaType & { folder: string | null, prefix: string | null };

/**
 * Hook to organize media files into Payload folder structure when page is published
 * Creates Pages/<Tenant>/<slug> folder structure for admin UI organization
 * Uses the page slug (which contains date + guid shorthand) for folder name
 * 
 * Note: Only updates Payload folder field (admin UI organization), NOT S3 prefix.
 * Files stay in their original S3 location to preserve previews and avoid broken URLs.
 * 
 * Security: Only reorganizes on create, or on update if slug actually changed.
 * This prevents accidental or malicious media file movement when updating published pages.
 * 
 * Runs when:
 * - Page is created and published
 * - Page transitions from draft to published
 * - Page is updated and slug changed (logs warning)
 */
export const organizeMediaFolders: CollectionAfterChangeHook<Page> = async ({
  doc,
  req,
  operation,
  previousDoc,
}) => {
  if (!['create', 'update'].includes(operation)) {
    return;
  }

  const isPublished = doc._status === 'published';
  
  if (!isPublished) {
    return;
  }

  if (operation === 'update' && previousDoc) {
    const slugChanged = doc.slug !== previousDoc.slug;
    const wasPublished = previousDoc._status === 'published';
    
    if (!slugChanged && wasPublished) {
      return;
    }
    
    // Handle slug change: ensure date pattern is present
    if (slugChanged && doc.slug) {
      await ensureSlugHasDate(doc, req);
      
      req.payload.logger.warn(
        `Page ${doc.id} slug changed from "${previousDoc.slug}" to "${doc.slug}". Reorganizing media files.`
      );
    }
  }

  async function ensureSlugHasDate(doc: Page, req: any) {
    const datePattern = /-\d{2}-\d{2}-\d{4}/;
    
    if (datePattern.test(doc.slug!)) {
      return; // Already has date
    }
    
    if (!doc.period?.start) {
      req.payload.logger.warn(
        `Page ${doc.id} slug changed to "${doc.slug}" without date pattern, but no period.start available to add date.`
      );
      return;
    }
    
    // Add date and guid to slug
    const periodStartDate = format(parseISO(doc.period.start), 'dd-MM-yyyy');
    const pageIdShort = doc.id.substring(0, 8);
    const updatedSlug = `${doc.slug}-${periodStartDate}-${pageIdShort}`;
    
    await req.payload.update({
      collection: 'pages',
      id: doc.id,
      data: { slug: updatedSlug },
    });
    
    doc.slug = updatedSlug;
    
    req.payload.logger.info(
      `Page ${doc.id} slug updated to include date: "${updatedSlug}"`
    );
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
  
  // Get tenant information
  const tenantId = typeof doc.tenant === 'string' ? doc.tenant : doc.tenant.id;
  const tenant = typeof doc.tenant === 'string' 
    ? await req.payload.findByID({ collection: 'tenants', id: tenantId })
    : doc.tenant;
  
  if (!tenant) {
    req.payload.logger.error(`Tenant not found for page ${pageId}`);
    return;
  }
  
  // Get tenant name (sanitize for folder name - use domain as it's more stable)
  // Extract subdomain from domain (e.g., "poznan.fsspx.pl" -> "poznan")
  const tenantDomain = (tenant as Tenant).domain || '';
  const tenantName = tenantDomain.split('.')[0] || (tenant as Tenant).name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || tenantId;
  
  // Use the page slug for folder name (slug already contains date + guid shorthand)
  // If slug is not available, generate from period start date + guid
  let pageFolderName: string;
  
  if (doc.slug) {
    pageFolderName = doc.slug;
  } else {
    // Fallback: generate folder name from period start date + guid
    if (!doc.period?.start) {
      req.payload.logger.error(`Page ${pageId} has no period start date and no slug`);
      return;
    }
    
    const periodStartDate = format(parseISO(doc.period.start), 'dd-MM-yyyy');
    const pageIdShort = pageId.substring(0, 8);
    pageFolderName = `${periodStartDate}-${pageIdShort}`;
  }
  
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
        // For root-level folders, explicitly check for null
        // This ensures we only match folders with no parent
        whereClause.and.push({ folder: { equals: null } });
      }

      const existingFolders = await req.payload.find({
        collection: 'payload-folders',
        where: whereClause,
        limit: 1,
      });

      if (existingFolders.docs.length > 0) {
        const foundFolder = existingFolders.docs[0];
        req.payload.logger.info(
          `Found existing folder: ${name} (ID: ${foundFolder.id}, parent: ${foundFolder.folder || 'root'})`
        );
        return foundFolder.id;
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

      req.payload.logger.info(
        `Created new folder: ${name} (ID: ${newFolder.id}, parent: ${parentId || 'root'})`
      );

      return newFolder.id;
    };

    // Create folder structure: Pages → <Tenant> → <slug>
    // No "Media" folder needed - we're already in the Media collection
    const pagesFolderId = await findOrCreateFolder('Pages');
    const tenantFolderId = await findOrCreateFolder(tenantName, pagesFolderId);
    const pageFolderId = await findOrCreateFolder(pageFolderName, tenantFolderId);

    req.payload.logger.info(
      `Created folder structure: Pages/${tenantName}/${pageFolderName} (folder ID: ${pageFolderId})`
    );

    // Update each media document's Payload folder (admin UI organization only)
    // Note: We do NOT update S3 prefix - files stay in their original S3 location
    // This preserves previews and avoids broken URLs
    for (const mediaId of mediaIds) {
      try {
        // Get current media document
        const media = await req.payload.findByID({
          collection: 'media',
          id: mediaId,
        }) as MediaWithFolders;

        // Check if folder needs to be updated
        // Handle both string ID and FolderInterface object
        let currentFolderId: string | null = null;
        if (typeof media.folder === 'string') {
          currentFolderId = media.folder;
        } else if (media.folder && typeof media.folder === 'object') {
          currentFolderId = (media.folder as any).id || null;
        }
        
        const needsFolderUpdate = currentFolderId !== pageFolderId;
        
        if (needsFolderUpdate) {
          await req.payload.update({
            collection: 'media',
            id: mediaId,
            data: {
              folder: pageFolderId,
              // Note: NOT updating prefix - files stay in original S3 location
            },
          });

          req.payload.logger.info(
            `Organized Media ${mediaId} into folder: Pages/${tenantName}/${pageFolderName}`
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
