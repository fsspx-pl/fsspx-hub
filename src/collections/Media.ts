import { dirname } from 'path'
import { CollectionConfig, CollectionBeforeChangeHook } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import { Media } from '@/payload-types'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Hook to set S3 prefix based on upload context
 * - Page attachments: uploads/posts/{pageId}
 * - Admin/media files: media (default)
 */
const setMediaPrefix: CollectionBeforeChangeHook<Media> = async ({
  data,
  req,
  operation,
}) => {
  // Default prefix for admin/media files
  if (!data.prefix) {
    data.prefix = 'media';
  }

  // Check if this upload is coming from a page's attachment field
  // When uploading through an upload field, PayloadCMS may include context in req
  const referer = req.headers?.referer || '';
  const isPageAttachment = referer.includes('/admin/collections/pages');

  // If it's a page attachment and we have a page ID in the context, set custom prefix
  // Note: This will be updated by the Pages afterChange hook if needed
  if (isPageAttachment && operation === 'create') {
    // We'll set the prefix in Pages afterChange hook after the page is saved
    // For now, keep default 'media' prefix
  }

  return data;
};

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    disableLocalStorage: true,
    // staticDir removed - using S3 storage instead
    // staticDir: path.resolve(__dirname, '../../media'),
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'prefix',
      label: {
        en: 'S3 Prefix',
        pl: 'Prefiks S3',
      },
      type: 'text',
      admin: {
        hidden: true,
        readOnly: true,
        description: {
          en: 'S3 storage prefix (automatically set based on upload context)',
          pl: 'Prefiks magazynu S3 (ustawiany automatycznie na podstawie kontekstu)',
        },
      },
    },
    {
      name: 'alt',
      label: {
        en: 'Alt Text',
        pl: 'Tekst alternatywny',
      },
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      label: {
        en: 'Caption',
        pl: 'Opis',
      },
      type: 'richText',
    },
  ],
  hooks: {
    beforeChange: [setMediaPrefix],
  },
}
