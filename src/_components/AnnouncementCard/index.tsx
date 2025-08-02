import { Badge } from '@/_components/Badge';
import Arrow from '@/_components/Calendar/ArrowButton/arrow.svg';
import { garamond } from '@/fonts';
import { Media, Page, User } from '@/payload-types';
import { formatAuthorName } from '@/utilities/formatAuthorName';
import { generateExcerpt } from '@/utilities/generateExcerpt';
import { isCurrentAnnouncement } from '@/utilities/isCurrentAnnouncement';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import React from 'react';
import { ArticleInfo } from '../ArticleInfo';
import { CMSLink } from '../Link';

type Props = {
  announcement: Page;
  className?: string;
  currentMonth?: Date;
};

export const AnnouncementCard: React.FC<Props> = ({
  announcement,
  className = '',
  currentMonth,
}) => {
  const author = announcement.author ? announcement.author as User : null;
  const authorName = formatAuthorName(author);
  const authorAvatar = author?.avatar ? author.avatar as Media : null;
  const excerpt = announcement.content ? generateExcerpt(announcement.content) : '';
  const date = announcement.period?.start ? format(new Date(announcement.period.start), 'dd.MM.yyyy', { locale: pl }) : '';
  const isCurrent = isCurrentAnnouncement(announcement);
  const dateFormatted = format(new Date(announcement.period?.start as string), 'dd-MM-yyyy', { locale: pl });
  const linkTo = `/ogloszenia/${dateFormatted}`;
  
  // Check if announcement spans across months and is being displayed in the spanned-to month
  const startDate = announcement.period?.start ? new Date(announcement.period.start) : null;
  const endDate = announcement.period?.end ? new Date(announcement.period.end) : null;
  const displayMonth = currentMonth || new Date();
  
  // Show "do:" text only when:
  // 1. Announcement spans across months (start and end in different months)
  // 2. Current display month is NOT the start month (i.e., we're in the spanned-to month)
  const isSpanningAnnouncement = startDate && endDate && 
    startDate.getMonth() !== endDate.getMonth() && 
    startDate.getMonth() !== displayMonth.getMonth() &&
    endDate.getMonth() === displayMonth.getMonth() &&
    endDate.getFullYear() === displayMonth.getFullYear();
  
  const endDateFormatted = endDate ? format(endDate, 'dd.MM.yyyy', { locale: pl }) : '';

  return (
    <article className={`prose prose-lg max-w-none w-full ${className}`}>
      {date && (
        <div className="flex justify-between items-baseline">
          <div className="flex flex-row items-center gap-2">
            {/* TODO: make link as reference */}
            <CMSLink url={linkTo}
            >
              <h3 className={`${garamond.className} m-0`}>
                {date}
              </h3>
            </CMSLink>
            {isCurrent && <Badge>Aktualne</Badge>}
          </div>
          {isSpanningAnnouncement && endDateFormatted && (
                <span className="text-sm text-gray-500 font-normal ml-2">
                  do: {endDateFormatted}
                </span>
              )}
        </div>
      )}
      
      {excerpt && (
        <p className="text-gray-600 leading-relaxed mt-3 mb-6 line-clamp-3 text-justify">
          {excerpt}
        </p>
      )}
              <div className="flex items-center justify-between">
                <div className="text-sm">
          <ArticleInfo
            author={authorName}
            avatar={authorAvatar}
            createdAt={announcement.createdAt}
            updatedAt={announcement.updatedAt}
            noDates={true}
          />
                </div>
          <CMSLink url={linkTo}
            className="flex items-center gap-2 mb-1 text-sm text-[#C81910]"
          >
            <span>Więcej</span>
            <Arrow className="w-4 h-3 fill-[#C81910]" />
          </CMSLink>
        </div>
    </article>
  );
}; 