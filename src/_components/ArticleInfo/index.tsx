import { Gothic_A1 } from 'next/font/google'
import React from 'react'
import Image from 'next/image'
import { Media as MediaType } from '@/payload-types'

const gothicA1 = Gothic_A1({
  weight: '500',
  subsets: ['latin'],
})

type Props = {
  author: string,
  avatar?: MediaType | null
  timestamp: string
}

export const ArticleInfo: React.FC<Props> = ({ author, avatar, timestamp }) => {
  return (
    <div className={`flex items-center gap-2 whitespace-nowrap ${gothicA1.className} text-gray-500`}>
      {avatar?.url && (
        <Image 
          src={avatar.url} 
          alt={author} 
          className="rounded-full h-full" 
          width={30}
          height={30} 
        />
      )}
      <span>
        {author}
      </span>
      <div className="hidden sm:flex items-center gap-2">
        <span>·</span>
        <span>{timestamp}</span>
      </div>
    </div>
  )
} 