import React from 'react';
import Link from 'next/link';
import { Event, Media } from '@/payload-types';
import { Media as MediaComponent } from '@/_components/Media';
import { Heading } from '@/_components/Heading';
import { garamond } from '@/fonts';
import TwoHeartsLogo from '@/_components/Logo/two-hearts-logo.svg';

type RelatedEventsProps = {
  events: (Event | string)[];
  className?: string;
};

export const RelatedEvents: React.FC<RelatedEventsProps> = ({
  events,
  className = '',
}) => {
  // Filter out string IDs and ensure we have Event objects
  const validEvents = events.filter(
    (event): event is Event => typeof event === 'object' && event !== null && 'slug' in event
  );

  if (validEvents.length === 0) {
    return null;
  }

  return (
    <div className={`w-full flex flex-col gap-6 ${className}`}>
      <Heading as="h2" className="text-xl sm:text-3xl mb-0 text-gray-900 dark:text-[#CCCCCC]">
        Powiązane
      </Heading>
      
      <div className="flex flex-col gap-4">
        {validEvents.map((event) => {
          const heroImage = event.heroImage && typeof event.heroImage === 'object' 
            ? event.heroImage as Media 
            : null;
          const eventSlug = event.slug;
          const eventUrl = `/wydarzenia/${eventSlug}`;

          return (
            <Link
              key={event.id}
              href={eventUrl}
              className="block w-full"
            >
              <div className="w-full overflow-hidden">
                {heroImage ? (
                  <div className="relative w-full aspect-[32/9] rounded-lg overflow-hidden">
                    <MediaComponent
                      resource={heroImage}
                      fill
                      className="relative w-full h-full"
                      imgClassName="object-cover w-full h-full"
                      size="100vw"
                    />
                  </div>
                ) : (
                  <div className="relative w-full aspect-[32/9] bg-gray-200 dark:bg-[#3C3F41] flex items-center justify-center rounded-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.05] pointer-events-none overflow-hidden dark-bg-logo">
                      <TwoHeartsLogo 
                        width={500}
                        height={650}
                        className="w-[130%] h-[130%]"
                      />
                    </div>
                    <span className="text-gray-400 dark:text-[#A9B7C6] text-sm relative z-10">Brak zdjęcia</span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className={`text-gray-900 dark:text-[#CCCCCC] text-lg font-medium line-clamp-2 mb-1 ${garamond.className}`}>
                    {event.title}
                  </h3>
                  <p className="text-[#C81910] dark:text-[#C81910] text-sm font-sans">
                    Wydarzenia
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

