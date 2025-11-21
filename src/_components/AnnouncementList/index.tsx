import { Page } from '@/payload-types';
import { format } from 'date-fns';
import React from 'react';
import { AnnouncementCard } from '../AnnouncementCard';
import { NewsletterSignupForm } from '../Newsletter/NewsletterSignupForm';

type Props = {
  announcements: Page[];
  className?: string;
  currentMonth?: Date;
  subdomain?: string;
};

type GroupedAnnouncements = {
  [key: string]: Page[];
};

export const AnnouncementList: React.FC<Props> = ({
  announcements,
  className = '',
  currentMonth,
  subdomain,
}) => {
  const monthToUse = currentMonth || new Date();
  const monthKey = format(monthToUse, 'yyyy-MM');
  
  const groupedAnnouncements: GroupedAnnouncements = {
    [monthKey]: announcements
  };

  const sortedMonths = Object.keys(groupedAnnouncements).sort((a, b) => a.localeCompare(b));

  if (sortedMonths.length === 0 || announcements.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Brak ogłoszeń</h3>
          <p className="text-gray-500">Dla tego miesiąca nie zostały opublikowane żadne ogłoszenia.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {sortedMonths.map((monthKey) => {
        const monthAnnouncements = groupedAnnouncements[monthKey];
        
        return (
          <section key={monthKey}>
            <div className="grid grid-cols-1 gap-10 auto-rows-fr mx-auto">
              {monthAnnouncements.map((announcement, index) => (
                <React.Fragment key={announcement.id}>
                  <AnnouncementCard
                    announcement={announcement}
                    currentMonth={monthToUse}
                  />
                  {index === 0 && subdomain && (
                    <NewsletterSignupForm subdomain={subdomain} className="mt-4" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}; 