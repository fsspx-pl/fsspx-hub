import { Gothic_A1 } from 'next/font/google'
import React from 'react'
import Image from 'next/image'
import { Media as MediaType } from '@/payload-types'

const gothicA1 = Gothic_A1({
  weight: '600',
  subsets: ['latin'],
})

type Props = {
  author: string,
  avatar?: MediaType | null
  timestamp: string
  small?: boolean
}

export const ArticleInfo: React.FC<Props> = ({ author, avatar, timestamp, small = false }) => {
  return (
    <div className={`flex items-center gap-2 ${gothicA1.className} text-gray-500 ${small ? 'text-sm' : ''}`}>
      {avatar?.url && (
        <Image 
          src={avatar.url} 
          alt={author} 
          className="rounded-full h-full" 
          width={small ? 24 : 30} 
          height={small ? 24 : 30} 
        />
      )}
      <span>
        {author}
      </span>
      <span>·</span>
      <span>{timestamp}</span>
    </div>
  )
} 