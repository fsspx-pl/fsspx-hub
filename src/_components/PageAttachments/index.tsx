import { Media } from '@/payload-types';
import { garamond } from '@/fonts';
import { CMSLink } from '@/_components/Link';

interface PageAttachmentsProps {
  attachments?: (string | Media)[] | null;
}

export function PageAttachments({ attachments }: PageAttachmentsProps) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className={`text-xl font-semibold text-gray-900 mb-3 ${garamond.className}`}>
        Załączniki
      </h3>
      <ul className="space-y-2">
        {attachments.map((attachment, index) => {
          const media = typeof attachment === 'string' ? null : attachment;
          if (!media) return null;
          
          const filename = media.filename || 'Unknown file';
          // PayloadCMS serves files via /api/media/file/{filename} or uses the url field
          const url = media.url || (media.filename ? `/api/media/file/${media.filename}` : '#');
          
          return (
            <li key={media.id || index} className="flex items-center gap-2">
              <svg
                className="w-5 h-5 flex-shrink-0 text-[#C81910]"
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
                className="text-sm font-medium truncate"
              >
                {filename}
              </CMSLink>
              <span className="text-xs text-gray-500 flex-shrink-0">(PDF)</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
