import React from 'react';
import { Event, Media, Tenant } from '@/payload-types';
import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import { RichText } from '@/_components/RichText';
import { Media as MediaComponent } from '@/_components/Media';
import { garamond } from '@/fonts';

type EventDetailsProps = {
  event: Event;
  tenant?: Tenant;
  className?: string;
  showHeroImage?: boolean;
};

export const EventDetails: React.FC<EventDetailsProps> = ({
  event,
  className = '',
  showHeroImage = true,
}) => {
  const startDate = event.startDate ? parseISO(event.startDate as string) : null;
  const endDate = event.endDate ? parseISO(event.endDate as string) : null;

  return (
    <div className={`space-y-6 ${className}`}>
      {showHeroImage && event.heroImage && (
        <div className="w-full">
          <MediaComponent
            imgClassName="w-full h-[300px] rounded-lg"
            resource={event.heroImage as Media}
            size="100vw"
          />
        </div>
      )}

      <div className="space-y-4">
        <h1 className={`text-4xl font-bold text-[var(--text-heading)] ${garamond.className}`}>
          {event.title}
        </h1>

        <div className="flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
          {startDate && (
            <div>
              <span className="font-medium">Data rozpoczęcia: </span>
              <span>{format(startDate, 'dd MMMM yyyy, HH:mm', { locale: pl })}</span>
            </div>
          )}
          {endDate && (
            <div>
              <span className="font-medium">Data zakończenia: </span>
              <span>{format(endDate, 'dd MMMM yyyy, HH:mm', { locale: pl })}</span>
            </div>
          )}
        </div>

        {event.content && (
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <RichText data={event.content} />
          </div>
        )}
      </div>
    </div>
  );
};

