'use client'

import { CMSLink } from '@/_components/Link'
import { garamond } from '@/fonts'
import { addDays, addMonths, format, getWeek, subDays, subMonths } from 'date-fns'
import { pl } from 'date-fns/locale'
import React from 'react'
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
          <CMSLink label={monthYear} preventNavigation className="text-gray-700 dark:text-[var(--text-primary)]" />
          {weekNumber && <div className="dark:text-[var(--text-primary)]">Tydz. {weekNumber}</div>}
        </div>
      )
    } else {
      return (
        <div className={baseClassName}>
          <span className="text-gray-700 dark:text-[var(--text-primary)]">{monthYear}</span>
          {weekNumber && <div className="text-gray-700 dark:text-[var(--text-primary)]">Tydz. {weekNumber}</div>}
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
        className={`text-gray-700 dark:text-[var(--text-primary)] hover:text-gray-700 dark:hover:text-[var(--text-primary)] relative top-1 ${titleClickable ? 'cursor-pointer' : ''}`}
        data-tooltip-id="view-toggle-tooltip"
        data-tooltip-content={tooltipText}
      >
        { getPeriodText() }
      </div>
      
      <ArrowButton 
        onClick={handleNext}
        disabled={disableNext}
      />
      
      {titleClickable && <Tooltip 
        id="view-toggle-tooltip"
        place="top"
      />}
    </div>
  )
} 