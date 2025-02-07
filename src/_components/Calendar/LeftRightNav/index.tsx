import React from 'react'
import ArrowButton from '../ArrowButton'

type Props = {
  onPrevious?: (...args: any) => any
  onNext?: (...args: any) => any
  prevDisabled?: boolean
  nextDisabled?: boolean
  className?: string
}

export const LeftRightNav: React.FC<Props> = ({ onPrevious, onNext, className, prevDisabled, nextDisabled }) => {
  return (
    <div className={`flex justify-between items-center gap-4 ${className}`}>
      <button onClick={onPrevious} disabled={prevDisabled}>
        <ArrowButton className="rotate-180" disabled={prevDisabled}/>
      </button>
      <button onClick={onNext} disabled={nextDisabled}>
        <ArrowButton disabled={nextDisabled}/>
      </button>
    </div>
  )
} 