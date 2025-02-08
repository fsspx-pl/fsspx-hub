import React from 'react'

type Props = {
  minutes: number
}

export const ReadingTime: React.FC<Props> = ({ minutes }) => {
  return (
    <div className="flex items-center gap-2">
      <span style={{ color: '#EB6265' }}>
        Tradycja
      </span>
      <span className="text-gray-500">
        {minutes} min czytania
      </span>
    </div>
  )
} 