'use client'

import { garamond } from '@/fonts'
import { format, isPast, isSameDay } from 'date-fns'
import React from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { Day } from '../Day'
import { useFeastData } from '../context/FeastDataContext'
import { polishLocale } from '../utils/polishLocale'
import styles from './MonthlyView.module.css'

interface MonthlyViewProps {
  onDaySelect: (date: Date) => void
}

export const MonthlyView: React.FC<MonthlyViewProps> = ({ onDaySelect }) => {
  const { selectedDay, currentDate } = useFeastData()

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    const classes = []
    if (view !== 'month') return ''

    if(selectedDay && isSameDay(date, selectedDay.date)) {
      classes.push('!bg-[#f8f7f7] rounded-lg')
    }

    if(isSameDay(date, currentDate)) {
      classes.push('!border-[2px] !border-[#d7d7d7] !border-solid !border-inset')
    }

    if(isPast(date) && !isSameDay(date, currentDate)) {
      classes.push('opacity-50')
    }

    return classes.join(' ')
  }

  const onClickDay = (value: Date) => {
    onDaySelect(value)
  }

  const tileContent = ({ date, view }: { date: Date; view: string }) => view === 'month' ? <Day date={date} hideDayName /> : null
  const formatDay= () => ''

  const formatShortWeekday = (locale: string | undefined, date: Date) => {
    return format(date, 'EEE', { locale: polishLocale }).replace('.', '')
  }
  
  return (
    <div className={`${styles.monthViewContainer} ${garamond.className}`}>
      <Calendar
        value={selectedDay?.date || currentDate}
        onClickDay={onClickDay}
        tileContent={tileContent}
        tileClassName={tileClassName}
        locale="pl"
        className={`${garamond.className} ${styles.calendar}`}
        showNeighboringMonth={false}
        formatDay={formatDay}
        formatShortWeekday={formatShortWeekday}
        showNavigation={false}
        next2Label={null}
        prev2Label={null}
        nextLabel={null}
        prevLabel={null}
      />
    </div>
  )
} 