import React from 'react'

type Props = {
  minutes: number
  small?: boolean
}

export const ReadingTime: React.FC<Props> = ({ minutes, small = false }) => {
  return (
    <div className="flex items-center gap-2">
      <span className={`${small ? 'text-sm' : 'text-lg'}`} style={{ color: '#EB6265' }}>
        Tradycja
      </span>
      <span className={`text-gray-500 ${small ? 'text-sm' : 'text-lg'}`}>
        {minutes} min czytania
      </span>
    </div>
  )
} 