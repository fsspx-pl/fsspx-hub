import { Gutter } from '@/_components/Gutter'
import { Media } from '@/_components/Media'
import { Media as MediaType } from '@/payload-types'
import { EB_Garamond, Gothic_A1 } from 'next/font/google'
import React from 'react'
import { ArticleInfo } from '../../ArticleInfo'
import { ReadingTime } from '../../ReadingTime'

const garamond = EB_Garamond({
  weight: '700',
  subsets: ['latin'],
})

const gothicA1 = Gothic_A1({
  weight: '500',
  subsets: ['latin'],
})

type Props = {
  image: MediaType & { alt: string }
  author: string
  authorAvatar: MediaType | null
  timestamp: string
  title: string
  excerpt: string
  readingTimeMinutes: number
  className?: string
}

export const BigImpact: React.FC<Props> = ({
  image,
  author,
  authorAvatar,
  timestamp,
  title,
  excerpt,
  readingTimeMinutes,
}) => {
  return (
    <Gutter className="flex w-full gap-8 md:gap-16 flex-col md:flex-row">
        <div className="w-full h-36 md:h-72 md:flex-1 relative rounded-lg overflow-hidden">
          <Media 
            resource={image}
            fill
          />
        </div>
        <div className="flex-1 flex flex-col gap-4">
          <ArticleInfo
            author={author}
            avatar={authorAvatar}
            timestamp={timestamp}
          />
          <div className='prose'>
            <h1 className={`${garamond.className} text-[#313238]`}>
              {title}
            </h1>
            <span className={`text-[#6A6C72] text-justify leading-relaxed ${gothicA1.className}`}>
              {excerpt}
            </span>
          </div>
          <ReadingTime minutes={readingTimeMinutes} />
        </div>
    </Gutter>
  )
} 