'use client'

import { formatDistanceToNow, parseISO, differenceInDays, differenceInWeeks, differenceInHours, differenceInMinutes } from "date-fns";
import { pl } from "date-fns/locale";
import React, { useEffect, useState, useRef } from "react";
import { Tooltip } from "react-tooltip";
import { format } from "date-fns";

export enum DateLabel {
  CREATED = "utworzono: ",
  UPDATED = "zaktualizowano: "
}
const dateConfig = {
  [DateLabel.CREATED]: { id: "createdAt" },
  [DateLabel.UPDATED]: { id: "updatedAt" },
};
const ONE_MINUTE = 60000;
const ONE_HOUR = ONE_MINUTE * 60;
const ONE_DAY = ONE_HOUR * 24;
const ONE_WEEK = ONE_DAY * 7;

/**
 * Formats date with custom Polish week handling
 */
const formatDistanceToNowWithCustomWeeks = (date: Date): string => {
  const now = new Date();
  const daysDifference = differenceInDays(now, date);
  const weeksDifference = differenceInWeeks(now, date);
  
  // Custom handling for 1-4 weeks
  if (daysDifference >= 7 && daysDifference < 30) {
    switch (weeksDifference) {
      case 1:
        return "tydzień temu";
      case 2:
        return "dwa tygodnie temu";
      case 3:
        return "trzy tygodnie temu";
      case 4:
        return "cztery tygodnie temu";
    }
  }
  
  // Use default formatting for other durations
  return formatDistanceToNow(date, {
    locale: pl,
    addSuffix: true,
  });
};

/**
 * Calculates appropriate update interval based on time difference
 */
const getUpdateInterval = (date: Date, referenceDate: Date): number => {
  const minutesDiff = differenceInMinutes(referenceDate, date);
  const hoursDiff = differenceInHours(referenceDate, date);
  const daysDiff = differenceInDays(referenceDate, date);
  
  if (minutesDiff < 60) {
    return ONE_MINUTE; // Update every minute for recent dates
  } else if (hoursDiff < 24) {
    return ONE_HOUR; // Update every hour for same-day dates
  } else if (daysDiff < 7) {
    return ONE_DAY; // Update daily for week-old dates
  } else {
    return ONE_WEEK; // Update weekly for older dates
  }
};

export const DateWithTooltip: React.FC<{
  icon: React.ElementType;
  label: DateLabel;
  date: string;
}> = ({ icon: Icon, label, date }) => {
  const [formattedDate, setFormattedDate] = useState<string>("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    const updateDateDisplay = () => {
      const inputDate = parseISO(date);
      const newFormatted = formatDistanceToNowWithCustomWeeks(inputDate);
      
      if (newFormatted !== formattedDate) {
        setFormattedDate(newFormatted);
      }
      
      // Calculate new interval for next update
      const newInterval = getUpdateInterval(inputDate, new Date());
      
      // Clear current interval and set a new one with dynamic timing
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      intervalRef.current = setInterval(updateDateDisplay, newInterval);
    };
    
    // Initial update
    updateDateDisplay();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [date, formattedDate]);
  
  const inputDate = parseISO(date);
  const tooltip = format(inputDate, 'EEEE, d MMMM yyyy, HH:mm', { locale: pl });
  const { id } = dateConfig[label];

  if (!formattedDate) {
    return null;
  }

  return (
    <>
      <Icon className="w-4 h-4" />
      <span className="hidden lg:flex">{label}</span>
      <span id={id} className="underline">
        {formattedDate}
      </span>
      <Tooltip anchorSelect={`#${id}`} content={tooltip} />
    </>
  );
};
