'use client'

import { Feast } from '@/feast'
import { Mass as MassType } from '@/payload-types'
import { addDays, format, isEqual, subDays } from 'date-fns'
import { pl } from 'date-fns/locale'
import { EB_Garamond, Gothic_A1 } from 'next/font/google'
import React from 'react'
import { Day } from './Day'
import { LeftRightNav as Nav } from './LeftRightNav'
import Mass from './Mass'
import { useFeastData } from './context/FeastDataContext'
import { romanize } from './utils/romanize'

const garamond = EB_Garamond({
  weight: [ '600', '400'],
  subsets: ['latin'],
})

const gothic = Gothic_A1({
  weight: ['400', '600', '800'],
  subsets: ['latin'],
})

export type FeastWithMasses = Feast & {masses: MassType[] }

const colorToHex = (color: string): string => {
  const colorMap: Record<string, string> = {
    'biały': 'text-black',
    'czerwony': 'text-red-500',
    'fioletowy': 'text-purple-500',
    'zielony': 'text-green-500',
    'czarny': 'text-black',
  };
  return colorMap[color.toLowerCase()] || color;
};


export const Calendar: React.FC = () => {
  const { handleDateSelect, selectedDay, feasts } = useFeastData();
  const firstFeastDate = feasts[0]?.date
  const month = selectedDay ? selectedDay.date : firstFeastDate
  const monthFormatted = format(month, 'LLLL', { locale: pl }).toUpperCase();
  const [firstDaySelected, setFirstDaySelected] = React.useState(false);
  const [lastDaySelected, setLastDaySelected] = React.useState(false);
  const [selectedDayColor, setSelectedDayColor] = React.useState(colorToHex('czarny'));

  React.useEffect(() => {
    const [ firstFeast, _ ] = feasts;
    setFirstDaySelected(selectedDay?.id === firstFeast.id);
    setLastDaySelected(selectedDay?.id === feasts[feasts.length - 1].id);
  }, [selectedDay, feasts]);

  React.useEffect(() => {
    if (selectedDay) {
      setSelectedDayColor(colorToHex(selectedDay.colors[0]));
    }
  }, [selectedDay]);

  return (
    <div className="w-full flex-col justify-start items-start gap-6 inline-flex">
      <div className="prose self-stretch flex flex-row justify-between items-center gap-4">
        <h2 className={`mb-0 text-[#34363b] ${garamond.className}`}>
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
          <div className={`self-stretch text-center text-[#4a4b4f] text-sm tracking-[3.78px] ${garamond.className} font-normal`}>
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
              <div className={`self-stretch flex-col justify-start items-start gap-1.5 flex ${gothic.className}`}>
                {selectedDay.title && (
                  <div className="text-[#4a4b4f] font-semibold leading-5">
                    {selectedDay.title}
                  </div>
                )}
                {selectedDay.rank && (
                  <div className="self-stretch text-sm text-[#4a4b4f]">
                    <span className="leading-[14px]">
                      święto { romanize(selectedDay.rank)} klasy
                    </span>
                    {selectedDay.colors.join(' ') && (
                      <>
                        <span className="leading-[14px]">  ·  kolor szat:  </span>
                        <span className={`${selectedDay.colors[0] === 'biały' ? 'bg-white px-2 py-1 rounded-lg' : null} ${selectedDayColor} leading-[14px]`}>{selectedDay.colors.join(' ')}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="flex-col text-sm justify-start items-start flex text-[#4a4b4f]">
              {selectedDay.masses.length > 0 ? (
                selectedDay.masses.map(mass => (
                  <Mass key={mass.id} time={mass.time} type={mass.type} />
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
