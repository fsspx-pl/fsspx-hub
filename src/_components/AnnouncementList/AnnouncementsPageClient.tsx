'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MonthNavigator } from './MonthNavigator';
import { AnnouncementList } from './index';
import { Page } from '@/payload-types';

type Props = {
  announcements: Page[];
  currentYear: number;
  currentMonth: number;
  domain: string;
};

export const AnnouncementsPageClient: React.FC<Props> = ({
  announcements: initialAnnouncements,
  currentYear: initialYear,
  currentMonth: initialMonth,
  domain,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get initial date from URL parameters or fall back to props
  const urlYear = searchParams.get('year');
  const urlMonth = searchParams.get('month');
  const initialDate = urlYear && urlMonth 
    ? new Date(parseInt(urlYear), parseInt(urlMonth) - 1, 1)
    : new Date(initialYear, initialMonth - 1, 1);
  
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [announcements, setAnnouncements] = useState<Page[]>(initialAnnouncements);
  const [isLoading, setIsLoading] = useState(false);

  const handleDateChange = async (newDate: Date) => {
    setIsLoading(true);
    setCurrentDate(newDate);
    
    try {
      const year = newDate.getFullYear();
      const month = newDate.getMonth() + 1;
      
      // Update URL with new month/year
      const params = new URLSearchParams(searchParams);
      params.set('year', year.toString());
      params.set('month', month.toString());
      router.push(`?${params.toString()}`, { scroll: false });
      
      // Fetch new data for the selected month
      const response = await fetch(`/api/announcements?year=${year}&month=${month}&domain=${domain}`);
      if (response.ok) {
        const newAnnouncements = await response.json();
        setAnnouncements(newAnnouncements);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <MonthNavigator
        currentDate={currentDate}
        onDateChange={handleDateChange}
      />
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Ładowanie ogłoszeń...</p>
        </div>
      ) : (
        <AnnouncementList announcements={announcements} />
      )}
    </div>
  );
}; 