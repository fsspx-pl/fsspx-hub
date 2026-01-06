import { Media } from '@/payload-types';
import { CMSLink } from '@/_components/Link';

interface PageAttachmentProps {
  media: Media;
}

export function PageAttachment({ media }: PageAttachmentProps) {
  const filename = media.filename || 'Unknown file';
  // PayloadCMS serves files via /api/media/file/{filename} or uses the url field
  const url = media.url || (media.filename ? `/api/media/file/${media.filename}` : '#');
  
  return (
    <div className="my-4 w-full">
      <div className="text-xs text-gray-500 mb-1">ZAŁĄCZNIK</div>
      <div className="flex items-center gap-2 w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
        <svg
          className="w-4 h-4 flex-shrink-0 text-[#C81910]"
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
          className="text-sm font-medium"
        >
          {filename}
        </CMSLink>
      </div>
    </div>
  );
}
