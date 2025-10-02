'use client'

import { isEqual } from 'date-fns'
import { Day } from '../Day'
import { FeastWithMasses } from '../index'

interface WeeklyViewProps {
  visibleDays: FeastWithMasses[]
  selectedDay: FeastWithMasses | undefined
  onDateSelect: (date: Date) => void
  getDayProps: (day: FeastWithMasses, index: number, visibleDays: FeastWithMasses[]) => {
    showWithOpacity: boolean
    hasMoreLeft: boolean
    hasMoreRight: boolean
  }
}

export const WeeklyView: React.FC<WeeklyViewProps> = ({
  visibleDays,
  selectedDay,
  onDateSelect,
  getDayProps
}) => {
  return (
    <div className="self-stretch justify-between items-center inline-flex">
      {visibleDays.map((day, index) => {
        const { showWithOpacity, hasMoreLeft, hasMoreRight } = getDayProps(day, index, visibleDays);
        const isCurrentDaySelected = isEqual(day.date, selectedDay?.date ?? '');
        
        return (
          <Day
            className={`flex-[0_0_calc(100%/7)] ${showWithOpacity ? 'opacity-50' : ''}`}
            key={day.id + index}
            date={day.date}
            isSelected={isCurrentDaySelected}
            onClick={() => onDateSelect(day.date)}
            hasMoreLeft={hasMoreLeft}
            hasMoreRight={hasMoreRight}
          />
        );
      })}
    </div>
  )
}
