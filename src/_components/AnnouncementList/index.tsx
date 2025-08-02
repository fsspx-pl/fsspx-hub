import React from 'react';
import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Page } from '@/payload-types';
import { AnnouncementCard } from '../AnnouncementCard';
import { garamond } from '@/fonts';

type Props = {
  announcements: Page[];
  className?: string;
};

type GroupedAnnouncements = {
  [key: string]: Page[];
};

export const AnnouncementList: React.FC<Props> = ({
  announcements,
  className = '',
}) => {
  // Group announcements by month
  const groupedAnnouncements: GroupedAnnouncements = announcements.reduce((groups, announcement) => {
    if (!announcement.period?.start) return groups;
    
    const date = parseISO(announcement.period.start);
    const monthKey = format(date, 'yyyy-MM');
    const monthLabel = format(date, 'MMMM yyyy', { locale: pl });
    
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    
    groups[monthKey].push(announcement);
    return groups;
  }, {} as GroupedAnnouncements);

  // Sort months in descending order (newest first)
  const sortedMonths = Object.keys(groupedAnnouncements).sort((a, b) => b.localeCompare(a));

  if (sortedMonths.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="max-w-md mx-auto">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Brak ogłoszeń</h3>
          <p className="text-gray-500">W tym miesiącu nie ma jeszcze żadnych ogłoszeń duszpasterskich.</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {monthAnnouncements.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}; 