'use client'

import { Feast, VestmentColor } from '@/feast'
import { garamond, gothic } from '@/fonts'
import { Service as ServiceType } from '@/payload-types'
import { format, isBefore, isEqual } from 'date-fns'
import { pl } from 'date-fns/locale'
import React from 'react'
import { Day } from './Day'
import { LeftRightNav as Nav } from './LeftRightNav'
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

const WINDOW_SIZE = 8;
const SHIFT_THRESHOLD = 6;
const BACKWARD_SHIFT_THRESHOLD = 1;

export const Calendar: React.FC<{ referenceDate: Date }> = ({ referenceDate }) => {
  const { handleDateSelect, selectedDay, feasts } = useFeastData();
  const firstFeastDate = feasts[0]?.date;
  const month = selectedDay ? selectedDay.date : firstFeastDate;
  const monthFormatted = format(month, 'LLLL', { locale: pl }).toUpperCase();

  // Initialize window start to center the selected day
  const [windowStart, setWindowStart] = React.useState(() => {
    if (!selectedDay) return 0;
    // Find index of selected day
    const selectedIndex = feasts.findIndex(
      feast => isEqual(feast.date, selectedDay.date)
    );
    if (selectedIndex === -1) return 0;
    
    // Calculate window start to center the selected day (or as close as possible)
    // Try to put selected day at position 3-4 in the window
    const idealPosition = 3; // 0-indexed, so this is the 4th position
    const calculatedStart = Math.max(0, selectedIndex - idealPosition);
    // Ensure we don't start beyond what would push the last few days off screen
    return Math.min(calculatedStart, Math.max(0, feasts.length - WINDOW_SIZE));
  });

  const visibleDays = React.useMemo(() => {
    return feasts.slice(windowStart, windowStart + WINDOW_SIZE);
  }, [feasts, windowStart]);

  const selectedDayIndex = React.useMemo(() => {
    if (!selectedDay) return -1;
    return feasts.findIndex(feast => isEqual(feast.date, selectedDay.date));
  }, [selectedDay, feasts]);

  const canGoNext = selectedDayIndex < feasts.length - 1;
  const canGoPrev = selectedDayIndex > 0;

  const handleNext = React.useCallback(() => {
    if (!canGoNext) return;
    
    const nextDayIndex = selectedDayIndex + 1;
    const nextDayPosition = nextDayIndex - windowStart;

    if (nextDayPosition >= SHIFT_THRESHOLD) {
      setWindowStart(prev => Math.min(prev + 1, feasts.length - WINDOW_SIZE));
    }

    handleDateSelect(feasts[nextDayIndex].date);
  }, [canGoNext, selectedDayIndex, feasts, handleDateSelect, windowStart]);

  const handlePrev = React.useCallback(() => {
    if (!canGoPrev) return;
    
    const prevDayIndex = selectedDayIndex - 1;
    const prevDayPosition = prevDayIndex - windowStart;

    if (prevDayPosition <= BACKWARD_SHIFT_THRESHOLD) {
      setWindowStart(prev => Math.max(prev - 1, 0));
    }

    handleDateSelect(feasts[prevDayIndex].date);
  }, [canGoPrev, selectedDayIndex, feasts, handleDateSelect, windowStart]);

  const [selectedDayColor, setSelectedDayColor] = React.useState(vestmentColorToTailwind(VestmentColor.BLACK));

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
          onNext={handleNext}
          onPrevious={handlePrev}
          nextDisabled={!canGoNext}
          prevDisabled={!canGoPrev}
        />
      </div>
      <div className="self-stretch flex-col justify-start items-start flex">
        <div className="self-stretch flex-col justify-center items-start gap-1.5 flex">
          <div className={`self-stretch text-center text-sm ${garamond.className} font-normal`}>
            {monthFormatted}
          </div>
          <div className="self-stretch justify-between items-center inline-flex min-w-[304px] sm:min-w-[368px]">
            {visibleDays.map((day, index) => {
              // Use today's actual date for past day detection
              const isPastDay = isBefore(day.date, referenceDate);
              const isCurrentDaySelected = isEqual(day.date, selectedDay?.date ?? '');
              
              // Only apply opacity to past days that aren't selected
              const showWithOpacity = isPastDay && !isCurrentDaySelected;
              
              // Check if this is an edge day (first or last in visible window)
              const isFirstInWindow = index === 0;
              const isLastInWindow = index === visibleDays.length - 1;
              
              // Only show edge gradients if there are more days to scroll
              const hasMoreLeft = isFirstInWindow && windowStart > 0;
              const hasMoreRight = isLastInWindow && windowStart + WINDOW_SIZE < feasts.length;
              
              return (
                <Day
                  className={`flex-1 ${showWithOpacity ? 'opacity-50' : ''}`}
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
        </div>
        {selectedDay && (
          <div className={`self-stretch p-4 rounded-b-lg flex-col justify-start items-start gap-6 flex bg-[#f8f7f7]`}>
            {(selectedDay.title || selectedDay.rank) && (
              <div className="self-stretch flex-col justify-start items-start gap-1.5 flex">
                {selectedDay.title && (
                  <div className={`font-semibold leading-5`}>
                    {selectedDay.title}
                  </div>
                )}
                {selectedDay.rank && (
                  <div className={`self-stretch text-sm`}>
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
            <div className={`flex-col text-sm justify-start items-start flex text-[#4a4b4f] gap-2 ${gothic.className}`}>
              {selectedDay.masses.length > 0 ? (
                selectedDay.masses.map((mass, idx) => (
                  <div key={idx} className="grid grid-cols-[auto_1fr] gap-x-4">
                    <span className='font-semibold'>{format(mass.time, 'HH:mm')}</span>
                    <div>{getServiceTitle(mass)}</div>
                    {mass.notes && <div></div>}
                    {mass.notes && (
                      <div className="text-xs text-[#6b7280]">{mass.notes}</div>
                    )}
                  </div>
                ))
              ) : (
                <div className='self-center text-[#a8a9ab]'>Brak nabożeństw tego dnia.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
