'use client'

import { Feast, VestmentColor } from '@/feast'
import { Service as ServiceType } from '@/payload-types'
import { isEqual } from 'date-fns'
import { useEffect, useState } from 'react'
import { Heading } from '../Heading'
import { PeriodNavigator } from '../PeriodNavigator'
import { MonthlyView } from './MonthlyView'
import { DayDetails } from './DayDetails'
import { WeeklyView } from './WeeklyView'
import { useFeastData } from './context/FeastDataContext'
import { useCalendarNavigation } from './hooks/useCalendarNavigation'
import { useCurrentDate } from './hooks/useCurrentDate'
import { usePastDayDetection } from './hooks/usePastDayDetection'
import { vestmentColorToTailwind } from './utils/vestmentColorToHex'

export type FeastWithMasses = Feast & {masses: ServiceType[] }

export const Calendar: React.FC = () => {
  const { handleDateSelect, selectedDay, feasts, viewMode, setViewMode, currentDate } = useFeastData();
  const { now } = useCurrentDate(feasts, selectedDay, handleDateSelect);
  const { visibleDays, navigateToDate } = useCalendarNavigation(feasts, selectedDay);
  const { getDayProps } = usePastDayDetection(feasts, now, selectedDay);

  const firstFeastDate = feasts[0]?.date;
  const displayDate = selectedDay ? selectedDay.date : (firstFeastDate || currentDate);

  const [selectedDayColor, setSelectedDayColor] = useState(vestmentColorToTailwind(VestmentColor.BLACK));

  useEffect(() => {
    if (!selectedDay) return;
    setSelectedDayColor(vestmentColorToTailwind(selectedDay.color));
  }, [selectedDay]);

  const handleToggleView = () => setViewMode(viewMode === 'monthly' ? 'weekly' : 'monthly')

  const handlePeriodChange = (newDate: Date) => {
    if (viewMode === 'weekly') {
      const exactFeast = feasts.find(feast => isEqual(feast.date, newDate))
      
      if (exactFeast) {
        handleDateSelect(exactFeast.date)
        navigateToDate(exactFeast.date)
      } else {
        const closestFeast = feasts.reduce((closest, feast) => {
          const currentDiff = Math.abs(feast.date.getTime() - newDate.getTime())
          const closestDiff = Math.abs(closest.date.getTime() - newDate.getTime())
          return currentDiff < closestDiff ? feast : closest
        })
        
        if (closestFeast) {
          handleDateSelect(closestFeast.date)
          navigateToDate(closestFeast.date)
        }
      }
    } else {
      const sameDay = feasts.find(feast => 
        feast.date.getDate() === newDate.getDate() && 
        feast.date.getMonth() === newDate.getMonth() &&
        feast.date.getFullYear() === newDate.getFullYear()
      )
      
      if (sameDay) {
        handleDateSelect(sameDay.date)
      } else {
        const firstInMonth = feasts.find(feast => 
          feast.date.getMonth() === newDate.getMonth() &&
          feast.date.getFullYear() === newDate.getFullYear()
        )
        
        if (firstInMonth) {
          handleDateSelect(firstInMonth.date)
        }
      }
    }
  }

  const handleMonthlyDaySelect = (date: Date) => {
    handleDateSelect(date)
    setViewMode('weekly')
    navigateToDate(date)
  }

  return (
    <div className="w-full flex-col justify-start items-start gap-6 inline-flex text-gray-700 dark:text-[#CCCCCC]">
      <div className="prose max-w-none self-stretch flex flex-row justify-between items-center gap-4 dark:prose-invert">
        <Heading as="h2" className="mb-0 text-xl sm:text-3xl text-gray-900 dark:text-[#CCCCCC]">
          Porządek nabożeństw
        </Heading>
      </div>
      
      <div className="self-stretch flex-col justify-start items-start flex">
        <div className="self-stretch flex-col justify-center items-start gap-1.5 flex">
          <PeriodNavigator
            currentDate={displayDate}
            viewMode={viewMode}
            onDateChange={handlePeriodChange}
            onToggleView={handleToggleView}
          />
          
          {viewMode === 'weekly' ? (
            <WeeklyView
              visibleDays={visibleDays}
              selectedDay={selectedDay}
              onDateSelect={handleDateSelect}
              getDayProps={getDayProps}
            />
          ) : (
            <MonthlyView onDaySelect={handleMonthlyDaySelect} />
          )}
        </div>
        
        {selectedDay && viewMode === 'weekly' && (
          <DayDetails
            selectedDay={selectedDay}
            selectedDayColor={selectedDayColor}
          />
        )}
      </div>
    </div>
  );
}
