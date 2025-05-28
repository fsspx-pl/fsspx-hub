'use client'

import React from 'react'
import Calendar from 'react-calendar'
import { format, isSameDay } from 'date-fns'
import { pl } from 'date-fns/locale'
import { useFeastData } from '../context/FeastDataContext'
import { VestmentColor } from '@/feast'
import { vestmentColorToTailwind } from '../utils/vestmentColorToHex'
import { garamond } from '@/fonts'
import 'react-calendar/dist/Calendar.css'
import styles from './MonthView.module.css'

interface MonthViewProps {
  onDaySelect: (date: Date) => void
}

export const MonthView: React.FC<MonthViewProps> = ({ onDaySelect }) => {
  const { feasts, selectedDay, currentDate } = useFeastData()

  const getFeastForDate = (date: Date) => {
    return feasts.find(feast => isSameDay(feast.date, date))
  }

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null
    
    const feast = getFeastForDate(date)
    if (!feast) return null

    const colorClass = vestmentColorToTailwind(feast.color)
    const isHighRank = feast.rank && feast.rank <= 2

    return (
      <div className={styles.feastIndicator}>
        <div 
          className={`${styles.feastDot} ${colorClass} ${isHighRank ? styles.feastDotHighRank : ''}`}
          title={feast.title}
        />
        {feast.masses.length > 0 && (
          <div className={styles.massIndicator} />
        )}
      </div>
    )
  }

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return ''
    
    const feast = getFeastForDate(date)
    const isSelected = selectedDay && isSameDay(selectedDay.date, date)
    
    let classes = 'relative'
    
    if (isSelected) {
      classes += ' !bg-blue-100 !text-blue-900'
    }
    
    if (feast?.rank && feast.rank <= 2) {
      classes += ' font-semibold'
    }
    
    return classes
  }

  const onClickDay = (value: Date) => {
    onDaySelect(value)
  }

  return (
    <div className={styles.monthViewContainer}>
      <Calendar
        value={selectedDay?.date || currentDate}
        onClickDay={onClickDay}
        tileContent={tileContent}
        tileClassName={tileClassName}
        locale="pl"
        formatShortWeekday={(locale, date) => format(date, 'EEE', { locale: pl })}
        formatMonthYear={(locale, date) => format(date, 'LLLL yyyy', { locale: pl })}
        className={`${garamond.className} ${styles.calendar}`}
        calendarType="gregory"
        showNeighboringMonth={false}
        next2Label={null}
        prev2Label={null}
        nextLabel="›"
        prevLabel="‹"
      />
    </div>
  )
} 