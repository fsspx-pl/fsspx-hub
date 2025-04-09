'use client'

import { Feast, VestmentColor } from '@/feast'
import { Service as ServiceType } from '@/payload-types'
import { addDays, format, isEqual, subDays } from 'date-fns'
import { pl } from 'date-fns/locale'
import React from 'react'
import { Day } from './Day'
import { LeftRightNav as Nav } from './LeftRightNav'
import { useFeastData } from './context/FeastDataContext'
import { romanize } from './utils/romanize'
import { garamond } from '@/fonts'
import { vestmentColorToTailwind } from './utils/vestmentColorToHex'
import { getMassLabel } from './utils/getMassLabel'

export type FeastWithMasses = Feast & {masses: ServiceType[] }

export const Calendar: React.FC = () => {
  const { handleDateSelect, selectedDay, feasts } = useFeastData();
  const firstFeastDate = feasts[0]?.date
  const month = selectedDay ? selectedDay.date : firstFeastDate
  const monthFormatted = format(month, 'LLLL', { locale: pl }).toUpperCase();
  const [firstDaySelected, setFirstDaySelected] = React.useState(false);
  const [lastDaySelected, setLastDaySelected] = React.useState(false);
  const [selectedDayColor, setSelectedDayColor] = React.useState(vestmentColorToTailwind(VestmentColor.BLACK));

  React.useEffect(() => {
    const [ firstFeast, _ ] = feasts;
    setFirstDaySelected(selectedDay?.id === firstFeast.id);
    setLastDaySelected(selectedDay?.id === feasts[feasts.length - 1].id);
  }, [selectedDay, feasts]);

  React.useEffect(() => {
    if (selectedDay) {
      setSelectedDayColor(vestmentColorToTailwind(selectedDay.color));
    }
  }, [selectedDay]);

  return (
    <div className="w-full flex-col justify-start items-start gap-6 inline-flex">
      <div className="prose max-w-none self-stretch flex flex-row justify-between items-center gap-4">
        <h2 className={`mb-0 ${garamond.className} text-xl sm:text-2xl`}>
          Porządek nabożeństw
        </h2>
        <Nav
          onNext={() => handleDateSelect(addDays(selectedDay?.date ?? firstFeastDate, 1))} onPrevious={() => handleDateSelect(subDays(selectedDay?.date ?? firstFeastDate, 1)) } 
          nextDisabled={lastDaySelected}
          prevDisabled={firstDaySelected}
        />
      </div>
      <div className="self-stretch flex-col justify-start items-start flex">
        <div className="self-stretch flex-col justify-center items-start gap-1.5 flex">
          <div className={`self-stretch text-center text-sm ${garamond.className} font-normal`}>
            {monthFormatted}
          </div>
          <div className="self-stretch justify-between items-center inline-flex">
            {feasts.map((day, index) => (
              <Day
                className="flex-1"
                key={day.id + index}
                date={day.date}
                isSelected={isEqual(day.date, selectedDay?.date ?? '')}
                onClick={() => handleDateSelect(day.date)}
              />
            ))}
          </div>
        </div>
        {selectedDay && (
          <div className={`self-stretch p-4 rounded-b-lg ${ !firstDaySelected && 'rounded-tl-lg' } ${ !lastDaySelected && 'rounded-tr-lg' } flex-col justify-start items-start gap-6 flex bg-[#f8f7f7]`}>
            {(selectedDay.title || selectedDay.rank) && (
              <div className="self-stretch flex-col justify-start items-start gap-1.5 flex">
                {selectedDay.title && (
                  <div className="font-semibold leading-5">
                    {selectedDay.title}
                  </div>
                )}
                {selectedDay.rank && (
                  <div className="self-stretch text-sm">
                    <span className="leading-[14px]">
                      święto { romanize(selectedDay.rank)} klasy
                    </span>
                    {selectedDay.color !== undefined && (
                      <>
                        <span className="leading-[14px]">  ·  kolor szat:  </span>
                        <span className={`${selectedDay.color === VestmentColor.WHITE ? 'bg-white px-2 py-1 rounded-lg' : null} ${selectedDayColor} leading-[14px]`}>{selectedDay.color}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="flex-col text-sm justify-start items-start flex text-[#4a4b4f]">
              {selectedDay.masses.length > 0 ? (
                selectedDay.masses.map((mass, idx) => (
                  <span key={idx}>{getMassLabel(mass.type, mass.time)}</span>
                ))
              ) : (
                <div className='self-center text-[#a8a9ab]'>Brak nabożeństw tego dnia.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
