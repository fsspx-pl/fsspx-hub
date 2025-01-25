import { Gothic_A1 } from 'next/font/google'
import React from 'react'

type Props = {
  minutes: number
}

const gothicA1 = Gothic_A1({
    weight: '500',
    subsets: ['latin'],
  })

export const ReadingTime: React.FC<Props> = ({ minutes }) => {
  return (
    <div className={`flex items-center gap-2 ${gothicA1.className}`}>
      <span style={{ color: '#EB6265' }}>
        Tradycja
      </span>
      <span className="text-gray-500">
        {minutes} min czytania
      </span>
    </div>
  )
} 