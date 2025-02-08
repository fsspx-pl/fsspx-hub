'use client'

import { garamond } from '@/fonts'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import React from 'react'

type Props = {
  date: Date
  isSelected?: boolean
  onClick?: () => void
  className?: string // Added className prop
}

export const Day: React.FC<Props> = ({ date, isSelected, onClick, className }) => { // Destructured className
  const isSunday = date.getDay() === 0;
  const textColor = isSunday ? 'text-[#c81910]' : 'text-[#4a4b4f]';
  const dayNumber = date.getDate();
  const dayName = format(date, 'EEE', { locale: pl }).replace('.', '');
  // const dayName = 
  
  return (
    <button 
      onClick={onClick}
      className={`p-3 flex-col justify-start items-center inline-flex ${isSelected ? 'bg-[#f8f7f7] rounded-t-lg' : ''} ${className}`}
    >
      <div className={`self-stretch text-[21.80px] font-semibold ${textColor} ${garamond.className}`}>
        {dayNumber}
      </div>
      <div className={`self-stretch text-center text-sm font-semibold ${textColor} ${garamond.className}`}>
        {dayName}
      </div>
    </button>
  )
} 