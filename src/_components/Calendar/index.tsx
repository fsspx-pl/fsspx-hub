'use client'

import { Feast, VestmentColor } from '@/feast'
import { garamond } from '@/fonts'
import { Service as ServiceType } from '@/payload-types'
import { format, isBefore, isEqual } from 'date-fns'
import React from 'react'
import { Day } from './Day'
import { MonthView } from './MonthView'
import { PeriodNavigator } from '../PeriodNavigator'
import { useFeastData } from './context/FeastDataContext'
import { massTypeMap } from './utils/massTypeMap'
import { romanize } from './utils/romanize'
import { vestmentColorToTailwind } from './utils/vestmentColorToHex'

export type FeastWithMasses = Feast & {masses: ServiceType[] }

const getServiceTitle = (service: ServiceType) => {
  if(service.category === 'lamentations') return `Gorzkie żale`;
  if(service.category === 'rosary') return `Różaniec`;
  if(service.category === 'mass' && service.massType) {
    return massTypeMap[service.massType];
  }
  return service.customTitle ?? '';
};

const WINDOW_SIZE = 7;

export const Calendar: React.FC = () => {
  const { handleDateSelect, selectedDay, feasts, viewMode, setViewMode, currentDate } = useFeastData();
  const now = new Date();
  
  // Select current day by default if no day is selected
  React.useEffect(() => {
    if (selectedDay) return;
    
    const today = new Date();
    const todayFeast = feasts.find(feast => isEqual(feast.date, today));
    if (!todayFeast) return;
    
    handleDateSelect(todayFeast.date);
  }, [selectedDay, feasts, handleDateSelect]);

  const firstFeastDate = feasts[0]?.date;
  const displayDate = selectedDay ? selectedDay.date : (firstFeastDate || currentDate);

  // Weekly view state and handlers
  const [windowStart, setWindowStart] = React.useState(() => {
    if (!selectedDay) return 0;
    
    const selectedIndex = feasts.findIndex(feast => isEqual(feast.date, selectedDay.date));
    if (selectedIndex === -1) return 0;
    
    const idealPosition = 3;
    const calculatedStart = Math.max(0, selectedIndex - idealPosition);
    return Math.min(calculatedStart, Math.max(0, feasts.length - WINDOW_SIZE));
  });

  const visibleDays = React.useMemo(() => {
    return feasts.slice(windowStart, windowStart + WINDOW_SIZE);
  }, [feasts, windowStart]);

  const [selectedDayColor, setSelectedDayColor] = React.useState(vestmentColorToTailwind(VestmentColor.BLACK));

  React.useEffect(() => {
    if (!selectedDay) return;
    setSelectedDayColor(vestmentColorToTailwind(selectedDay.color));
  }, [selectedDay]);

  const handleToggleView = () => {
    setViewMode(viewMode === 'monthly' ? 'weekly' : 'monthly')
  }

  // Handle period navigation (week/month changes)
  const handlePeriodChange = (newDate: Date) => {
    if (viewMode === 'weekly') {
      // In weekly mode, find the exact feast for the new date or closest one
      const exactFeast = feasts.find(feast => isEqual(feast.date, newDate))
      
      if (exactFeast) {
        handleDateSelect(exactFeast.date)
        
        // Update window position to center the selected day
        const selectedIndex = feasts.findIndex(feast => isEqual(feast.date, exactFeast.date));
        if (selectedIndex !== -1) {
          const idealPosition = 3;
          const calculatedStart = Math.max(0, selectedIndex - idealPosition);
          setWindowStart(Math.min(calculatedStart, Math.max(0, feasts.length - WINDOW_SIZE)));
        }
      } else {
        // If exact date doesn't exist, find closest feast
        const closestFeast = feasts.reduce((closest, feast) => {
          const currentDiff = Math.abs(feast.date.getTime() - newDate.getTime())
          const closestDiff = Math.abs(closest.date.getTime() - newDate.getTime())
          return currentDiff < closestDiff ? feast : closest
        })
        
        if (closestFeast) {
          handleDateSelect(closestFeast.date)
          
          // Update window position to center the selected day
          const selectedIndex = feasts.findIndex(feast => isEqual(feast.date, closestFeast.date));
          if (selectedIndex !== -1) {
            const idealPosition = 3;
            const calculatedStart = Math.max(0, selectedIndex - idealPosition);
            setWindowStart(Math.min(calculatedStart, Math.max(0, feasts.length - WINDOW_SIZE)));
          }
        }
      }
    } else {
      // In monthly mode, just update the selected day if it exists in the new month
      const sameDay = feasts.find(feast => 
        feast.date.getDate() === newDate.getDate() && 
        feast.date.getMonth() === newDate.getMonth() &&
        feast.date.getFullYear() === newDate.getFullYear()
      )
      
      if (sameDay) {
        handleDateSelect(sameDay.date)
      } else {
        // Find first feast in the new month
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

  // Handle day selection in monthly view - switch to weekly view with selected day
  const handleMonthlyDaySelect = React.useCallback((date: Date) => {
    handleDateSelect(date)
    setViewMode('weekly')
    
    // Update window position to center the selected day
    const selectedIndex = feasts.findIndex(feast => isEqual(feast.date, date));
    if (selectedIndex !== -1) {
      const idealPosition = 3;
      const calculatedStart = Math.max(0, selectedIndex - idealPosition);
      setWindowStart(Math.min(calculatedStart, Math.max(0, feasts.length - WINDOW_SIZE)));
    }
  }, [handleDateSelect, setViewMode, feasts])

  return (
    <div className="w-full flex-col justify-start items-start gap-6 inline-flex text-gray-700">
      <div className="prose max-w-none self-stretch flex flex-row justify-between items-center gap-4">
        <h2 className={`mb-0 ${garamond.className} text-xl sm:text-3xl text-gray-700`}>
          Porządek nabożeństw
        </h2>
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
            <div className="self-stretch justify-between items-center inline-flex">
              {visibleDays.map((day, index) => {
                const isPastDay = isBefore(day.date, now);
                const isCurrentDaySelected = isEqual(day.date, selectedDay?.date ?? '');
                const showWithOpacity = isPastDay && !isCurrentDaySelected;
                const isFirstInWindow = index === 0;
                const isLastInWindow = index === visibleDays.length - 1;
                const hasMoreLeft = isFirstInWindow && windowStart > 0;
                const hasMoreRight = isLastInWindow && windowStart + WINDOW_SIZE < feasts.length;
                
                return (
                  <Day
                    className={`flex-[0_0_calc(100%/7)] ${showWithOpacity ? 'opacity-50' : ''}`}
                    key={day.id + index}
                    date={day.date}
                    isSelected={isCurrentDaySelected}
                    onClick={() => handleDateSelect(day.date)}
                    hasMoreLeft={hasMoreLeft}
                    hasMoreRight={hasMoreRight}
                  />
                );
              })}
            </div>
          ) : (
            <MonthView onDaySelect={handleMonthlyDaySelect} />
          )}
        </div>
        
        {selectedDay && viewMode === 'weekly' && (
          <div className={`self-stretch p-4 rounded-b-lg flex-col justify-start items-start gap-6 flex bg-[#f8f7f7]`}>
            {(selectedDay.title || selectedDay.rank) && (
              <div className="self-stretch flex-col justify-start items-start gap-1.5 flex">
                {selectedDay.title && (
                  <span className={`font-semibold leading-5`}>
                    {selectedDay.title}
                  </span>
                )}
                {selectedDay.rank && (
                  <div className={`self-stretch text-sm`}>
                    <span className="leading-[14px]">
                      { romanize(selectedDay.rank)} klasy
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
            <div className={`flex-col text-sm justify-start items-start flex gap-2`}>
              {selectedDay.masses.length > 0 ? (
                selectedDay.masses.map((mass, idx) => (
                  <div key={idx} className="grid grid-cols-[auto_1fr] gap-x-4">
                    <span className='font-semibold'>{format(mass.date, 'HH:mm')}</span>
                    <div>{getServiceTitle(mass)}</div>
                    {mass.notes && <div></div>}
                    {mass.notes && (
                      <div className="text-xs text-gray-400">{mass.notes}</div>
                    )}
                  </div>
                ))
              ) : (
                <div className='self-center text-gray-400'>Brak nabożeństw tego dnia.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
