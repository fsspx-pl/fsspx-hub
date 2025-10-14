'use client'

import { VestmentColor } from '@/feast'
import { format } from 'date-fns'
import { NO_MASSES_MESSAGE } from '../const'
import { FeastWithMasses } from '../index'
import { getServiceTitle } from '../utils/getServiceTitle'
import { romanize } from '../utils/romanize'

interface SelectedDayDetailsProps {
  selectedDay: FeastWithMasses
  selectedDayColor: string
}

export const DayDetails: React.FC<SelectedDayDetailsProps> = ({
  selectedDay,
  selectedDayColor
}) => {
  return (
    <div className="self-stretch p-4 rounded-b-lg flex-col justify-start items-start gap-6 flex bg-[#f8f7f7]">
      {(selectedDay.title || selectedDay.rank) && (
        <div className="self-stretch flex-col justify-start items-start gap-1.5 flex">
          {selectedDay.title && (
            <span className="font-semibold leading-5">
              {selectedDay.title}
            </span>
          )}
          {selectedDay.rank && (
            <div className="self-stretch text-sm">
              <span className="leading-[14px]">
                {romanize(selectedDay.rank)} klasy
              </span>
              {selectedDay.color !== undefined && (
                <>
                  <span className="leading-[14px]">  ·  kolor szat:  </span>
                  <span className={`${selectedDay.color === VestmentColor.WHITE ? 'bg-white px-2 py-1 rounded-lg' : null} ${selectedDayColor} leading-[14px]`}>
                    {selectedDay.color}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      )}
      <div className="flex-col text-sm justify-start items-start flex gap-2">
        {selectedDay.masses.length > 0 ? (
          selectedDay.masses.map((mass, idx) => (
            <div key={idx} className="grid grid-cols-[auto_1fr] gap-x-4">
              <span className="font-semibold">{format(mass.date, 'HH:mm')}</span>
              <div>{getServiceTitle(mass)}</div>
              {mass.notes && <div></div>}
              {mass.notes && (
                <div className="text-xs text-gray-400">{mass.notes}</div>
              )}
            </div>
          ))
        ) : (
          <div className="self-center text-gray-400">{NO_MASSES_MESSAGE}</div>
        )}
      </div>
    </div>
  )
}
