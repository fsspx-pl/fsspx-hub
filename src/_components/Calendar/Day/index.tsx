'use client'

import { garamond } from '@/fonts'
import { formatInTimeZone } from 'date-fns-tz'
import React from 'react'
import { POLISH_TIMEZONE } from '../../../common/timezone'
import { polishLocale } from '../utils/polishLocale'

type Props = {
  date: Date
  isSelected?: boolean
  onClick?: () => void
  className?: string
  hasMoreLeft?: boolean
  hasMoreRight?: boolean
  hideDayName?: boolean
}

export const Day: React.FC<Props> = ({ 
  date, 
  isSelected, 
  onClick, 
  className, 
  hasMoreLeft, 
  hasMoreRight,
  hideDayName = false,
}) => {
  const isSunday = date.getDay() === 0;
  const textColor = isSunday ? 'text-[#c81910]' : 'text-[#4a4b4f]';
  const dayNumber = date.getDate();
  const dayName = formatInTimeZone(date, POLISH_TIMEZONE, 'EEE', { locale: polishLocale }).replace('.', '')
  
  return (
    <div 
      onClick={onClick}
      className={`
        min-w-[38px] sm:min-w-[46px]
        p-1 sm:p-3
        text-center
        cursor-pointer
        flex-col justify-start items-center inline-flex 
        transition-all duration-300 ease-in-out
        ${isSelected ? 'bg-[#f8f7f7] rounded-t-lg' : ''} 
        ${className}
        relative
      `}
    >
      <div 
        className={`
          self-stretch font-semibold text-xl
          ${textColor} ${garamond.className}
          transition-opacity duration-300
          relative
        `}
      >
        {dayNumber}
        {(hasMoreLeft || hasMoreRight) && !isSelected && (
          <div className={`
            absolute inset-0 pointer-events-none
            ${hasMoreLeft ? 'bg-gradient-to-r from-white via-white to-transparent' : ''}
            ${hasMoreRight ? 'bg-gradient-to-l from-white via-white to-transparent' : ''}
            opacity-70
          `} />
        )}
      </div>
      <div 
        className={`
          self-stretch text-center text-sm font-semibold 
          ${textColor} ${garamond.className}
          transition-opacity duration-300
          relative
        `}
      >
        {!hideDayName && dayName}
        {(hasMoreLeft || hasMoreRight) && !isSelected && (
          <div className={`
            absolute inset-0 pointer-events-none
            ${hasMoreLeft ? 'bg-gradient-to-r from-white via-white to-transparent' : ''}
            ${hasMoreRight ? 'bg-gradient-to-l from-white via-white to-transparent' : ''}
            opacity-70
          `} />
        )}
      </div>
    </div>
  )
} 