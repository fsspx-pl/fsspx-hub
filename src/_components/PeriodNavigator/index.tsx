'use client'

import React from 'react'
import { format, getWeek, addMonths, subMonths, subDays, addDays } from 'date-fns'
import { pl } from 'date-fns/locale'
import { garamond } from '@/fonts'
import { CMSLink } from '@/_components/Link'
import { Tooltip } from 'react-tooltip'
import ArrowButton from '../Calendar/ArrowButton'

interface PeriodNavigatorProps {
  currentDate: Date
  viewMode: 'weekly' | 'monthly'
  onDateChange: (date: Date) => void
  onToggleView?: () => void
  titleClickable?: boolean
  disablePrevious?: boolean
  disableNext?: boolean
}

export const PeriodNavigator: React.FC<PeriodNavigatorProps> = ({
  currentDate,
  viewMode,
  onDateChange,
  onToggleView,
  titleClickable = true,
  disablePrevious = false,
  disableNext = false
}) => {
  const handlePrevious = () => {
    const newDate = viewMode === 'weekly' 
      ? subDays(currentDate, 1)
      : subMonths(currentDate, 1)
    onDateChange(newDate)
  }

  const handleNext = () => {
    const newDate = viewMode === 'weekly'
      ? addDays(currentDate, 1)
      : addMonths(currentDate, 1)
    onDateChange(newDate)
  }

  const getPeriodText = () => {
    const monthYear = format(currentDate, 'LLLL yyyy', { locale: pl }).toUpperCase()
    const baseClassName = `${garamond.className} flex flex-col items-center`
    
    const weekNumber = viewMode === 'weekly' && getWeek(currentDate, { 
      weekStartsOn: 1,
      firstWeekContainsDate: 4 
    })
    
    if (titleClickable) {
      return (
        <div className={baseClassName}>
          <CMSLink label={monthYear} preventNavigation />
          {weekNumber && <div>Tydz. {weekNumber}</div>}
        </div>
      )
    } else {
      return (
        <div className={baseClassName}>
          <span>{monthYear}</span>
          {weekNumber && <div>Tydz. {weekNumber}</div>}
        </div>
      )
    }
  }

  const tooltipText = viewMode === 'weekly' 
    ? 'Kliknij, aby przejść do widoku miesięcznego'
    : 'Kliknij, aby przejść do widoku tygodniowego'

  return (
    <div className="flex items-start justify-between py-3 w-full gap-4">
      <ArrowButton 
        className="rotate-180" 
        onClick={handlePrevious}
        disabled={disablePrevious}
      />
      
      <div 
        onClick={onToggleView} 
        className="text-gray-700 hover:text-gray-700 relative top-1 cursor-pointer"
        data-tooltip-id="view-toggle-tooltip"
        data-tooltip-content={tooltipText}
      >
        { getPeriodText() }
      </div>
      
      <ArrowButton 
        onClick={handleNext}
        disabled={disableNext}
      />
      
      <Tooltip 
        id="view-toggle-tooltip"
        place="top"
      />
    </div>
  )
} 