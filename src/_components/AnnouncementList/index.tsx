import React from 'react';
import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Page } from '@/payload-types';
import { AnnouncementCard } from '../AnnouncementCard';
import { garamond } from '@/fonts';

type Props = {
  announcements: Page[];
  className?: string;
  currentMonth?: Date;
};

type GroupedAnnouncements = {
  [key: string]: Page[];
};

export const AnnouncementList: React.FC<Props> = ({
  announcements,
  className = '',
  currentMonth,
}) => {
  const monthToUse = currentMonth || new Date();
  const monthKey = format(monthToUse, 'yyyy-MM');
  
  const groupedAnnouncements: GroupedAnnouncements = {
    [monthKey]: announcements
  };

  const sortedMonths = Object.keys(groupedAnnouncements).sort((a, b) => b.localeCompare(a));

  if (sortedMonths.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Brak ogłoszeń</h3>
          <p className="text-gray-500">W tym miesiącu nie zostały opublikowane żadne ogłoszenia.</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
              {monthAnnouncements
                .sort((a, b) => {
                  const dateA = a.period?.start ? new Date(a.period.start) : new Date(0);
                  const dateB = b.period?.start ? new Date(b.period.start) : new Date(0);
                  return dateA.getTime() - dateB.getTime();
                })
                .map((announcement) => (
                  <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    currentMonth={monthToUse}
                  />
                ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}; 