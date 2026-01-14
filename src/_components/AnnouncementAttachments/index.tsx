import { Media } from '@/payload-types'
import { CMSLink } from '@/_components/Link'

interface AnnouncementAttachmentsProps {
  attachments?: Media | (string | Media)[] | null
}

/**
 * Internal component to render a single attachment link item
 */
function AttachmentLink({ media }: { media: Media }) {
  const filename = media.filename || 'Unknown file'
  // PayloadCMS serves files via /api/media/file/{filename} or uses the url field
  const url = media.url || (media.filename ? `/api/media/file/${media.filename}` : '#')

  return (
    <div className="flex items-center gap-2">
      <svg
        className="w-4 h-4 flex-shrink-0 text-[var(--color-primary)]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
      <CMSLink
        url={url}
        newTab={true}
        className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]"
      >
        {filename}
      </CMSLink>
    </div>
  )
}

/**
 * Renders one or more attachments.
 * - Single attachment: renders with "ZAŁĄCZNIK" label (singular)
 * - Multiple attachments: renders in one block with "ZAŁĄCZNIKI" label (plural) and grouped links
 * Accepts either a single Media object or an array of Media objects.
 */
export function AnnouncementAttachments({ attachments }: AnnouncementAttachmentsProps) {
  if (!attachments) {
    return null
  }

  // Handle single Media object
  if (typeof attachments === 'object' && 'id' in attachments && !Array.isArray(attachments)) {
    const filename = attachments.filename || 'Unknown file'
    const url = attachments.url || (attachments.filename ? `/api/media/file/${attachments.filename}` : '#')

    return (
      <div className="my-4 w-full">
        <div className="text-xs text-[var(--text-secondary)] mb-1">ZAŁĄCZNIK</div>
        <div className="flex items-center gap-2 w-full px-3 py-2 bg-gray-50 dark:bg-[#3C3F41] rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-[var(--text-primary)]">
          <svg
            className="w-4 h-4 flex-shrink-0 text-[var(--color-primary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <CMSLink
            url={url}
            newTab={true}
            className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]"
          >
            {filename}
          </CMSLink>
        </div>
      </div>
    )
  }

  // Handle array of attachments
  if (Array.isArray(attachments)) {
    const validMedia = attachments
      .map((attachment) => (typeof attachment === 'string' ? null : attachment))
      .filter((media): media is Media => media !== null)

    if (validMedia.length === 0) {
      return null
    }

    // Single attachment in array - render as singular
    if (validMedia.length === 1) {
      const media = validMedia[0]
      const filename = media.filename || 'Unknown file'
      const url = media.url || (media.filename ? `/api/media/file/${media.filename}` : '#')

      return (
        <div className="my-4 w-full">
          <div className="text-xs text-[var(--text-secondary)] mb-1">ZAŁĄCZNIK</div>
          <div className="flex items-center gap-2 w-full px-3 py-2 bg-gray-50 dark:bg-[#3C3F41] rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-[var(--text-primary)]">
            <svg
              className="w-4 h-4 flex-shrink-0 text-[var(--color-primary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <CMSLink url={url} newTab={true} className="text-sm font-medium">
              {filename}
            </CMSLink>
          </div>
        </div>
      )
    }

    // Multiple attachments - render in one block with plural label
    return (
      <div className="my-4 w-full">
        <div className="text-xs text-[var(--text-secondary)] mb-1">ZAŁĄCZNIKI</div>
        <div className="w-full px-3 py-2 bg-gray-50 dark:bg-[#3C3F41] rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-[var(--text-primary)]">
          <div className="flex flex-col gap-2">
            {validMedia.map((media, index) => (
              <AttachmentLink key={media.id || index} media={media} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}

