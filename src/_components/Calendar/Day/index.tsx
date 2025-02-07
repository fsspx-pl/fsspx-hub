'use client'

import { EB_Garamond } from 'next/font/google'
import React from 'react'

const garamond = EB_Garamond({
  weight: '600',
  subsets: ['latin'],
})

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
  const dayName = date.toLocaleDateString('pl-PL', { weekday: 'short' });
  
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