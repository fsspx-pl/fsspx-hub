'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PeriodNavigator } from '../PeriodNavigator';
import { AnnouncementList } from './index';
import { Announcement } from '@/payload-types';
import { LoadingIndicator } from '../LoadingIndicator';

type Props = {
  announcements: Announcement[];
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
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [isLoading, setIsLoading] = useState(false);
  
  const now = new Date();
  const isCurrentMonth = currentDate.getFullYear() === now.getFullYear() && 
                        currentDate.getMonth() === now.getMonth();

  const handleDateChange = async (newDate: Date) => {
    setIsLoading(true);
    setCurrentDate(newDate);
    
    try {
      const year = newDate.getFullYear();
      const month = newDate.getMonth() + 1;
      
      const params = new URLSearchParams(searchParams);
      params.set('year', year.toString());
      params.set('month', month.toString());
      router.push(`?${params.toString()}`, { scroll: false });
      
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
      <PeriodNavigator
        currentDate={currentDate}
        viewMode="monthly"
        onDateChange={handleDateChange}
        titleClickable={false}
        disableNext={isCurrentMonth}
      />
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <LoadingIndicator />
          <p className="mt-2 text-[var(--text-primary)]">Ładowanie ogłoszeń...</p>
        </div>
      ) : (
        <AnnouncementList announcements={announcements} currentMonth={currentDate} />
      )}
    </div>
  );
}; 