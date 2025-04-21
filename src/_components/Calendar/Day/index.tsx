'use client'

import { garamond } from '@/fonts'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import React from 'react'

type Props = {
  date: Date
  isSelected?: boolean
  onClick?: () => void
  className?: string
  hasMoreLeft?: boolean
  hasMoreRight?: boolean
}

export const Day: React.FC<Props> = ({ 
  date, 
  isSelected, 
  onClick, 
  className, 
  hasMoreLeft, 
  hasMoreRight,
}) => {
  const isSunday = date.getDay() === 0;
  const textColor = isSunday ? 'text-[#c81910]' : 'text-[#4a4b4f]';
  const dayNumber = date.getDate();
  const dayName = format(date, 'EEE', { locale: pl }).replace('.', '');
  
  return (
    <button 
      onClick={onClick}
      className={`
        min-w-[38px] sm:min-w-[60px]
        p-1 sm:p-3 
        flex-col justify-start items-center inline-flex 
        transition-all duration-300 ease-in-out
        ${isSelected ? 'bg-[#f8f7f7] rounded-t-lg' : ''} 
        ${className}
        relative
      `}
    >
      <div 
        className={`
          self-stretch text-[21.80px] font-semibold 
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
        {dayName}
        {(hasMoreLeft || hasMoreRight) && !isSelected && (
          <div className={`
            absolute inset-0 pointer-events-none
            ${hasMoreLeft ? 'bg-gradient-to-r from-white via-white to-transparent' : ''}
            ${hasMoreRight ? 'bg-gradient-to-l from-white via-white to-transparent' : ''}
            opacity-70
          `} />
        )}
      </div>
    </button>
  )
} 