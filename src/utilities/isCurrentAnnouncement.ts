import { Announcement } from '@/payload-types';

export const isCurrentAnnouncement = (announcement: Announcement): boolean => {
  if (!announcement.period?.start || !announcement.period?.end) {
    return false;
  }

  const now = new Date();
  const startDate = new Date(announcement.period.start);
  const endDate = new Date(announcement.period.end);

  return now >= startDate && now <= endDate;
}; 