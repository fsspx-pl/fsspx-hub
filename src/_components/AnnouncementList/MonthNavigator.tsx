'use client'

import React from 'react'
import { format, addMonths, subMonths } from 'date-fns'
import { pl } from 'date-fns/locale'
import { garamond } from '@/fonts'
import ArrowButton from '../Calendar/ArrowButton'

interface MonthNavigatorProps {
  currentDate: Date
  onDateChange: (date: Date) => void
}

export const MonthNavigator: React.FC<MonthNavigatorProps> = ({
  currentDate,
  onDateChange,
}) => {
  const handlePrevious = () => {
    const newDate = subMonths(currentDate, 1)
    onDateChange(newDate)
  }

  const handleNext = () => {
    const newDate = addMonths(currentDate, 1)
    onDateChange(newDate)
  }

  const getMonthText = () => {
    const monthYear = format(currentDate, 'LLLL yyyy', { locale: pl }).toUpperCase()
    
    return (
      <div className={`${garamond.className} flex flex-col items-center`}>
        <span className="text-gray-700">{monthYear}</span>
      </div>
    )
  }

  return (
    <div className="flex items-start justify-between py-3 w-full gap-4">
      <ArrowButton 
        className="rotate-180" 
        onClick={handlePrevious}
      />
      
      <div className="text-gray-700 relative top-1">
        { getMonthText() }
      </div>
      
      <ArrowButton 
        onClick={handleNext}
      />
    </div>
  )
} 