import { Gutter } from '@/_components/Gutter'
import { Media } from '@/_components/Media'
import { garamond, gothic } from '@/fonts'
import { Media as MediaType } from '@/payload-types'
import React from 'react'
import { ArticleInfo } from '../../ArticleInfo'
import { ReadingTime } from '../../ReadingTime'

type Props = {
  image: MediaType & { alt: string }
  author: string
  authorAvatar: MediaType | null
  createdAt: string,
  updatedAt: string,
  title: string
  excerpt: string
  readingTimeMinutes: number
  className?: string
  now: string
}

export const BigImpact: React.FC<Props> = ({
  image,
  author,
  authorAvatar,
  createdAt,
  updatedAt,
  title,
  excerpt,
  readingTimeMinutes,
  now,
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
            createdAt={createdAt}
            updatedAt={updatedAt}
            now={now}
          />
          <div className='prose'>
            <h1 className={`${garamond.className}`}>
              {title}
            </h1>
            <span className={`text-[#6A6C72] text-justify leading-relaxed ${gothic.className}`}>
              {excerpt}
            </span>
          </div>
          <ReadingTime minutes={readingTimeMinutes} />
        </div>
    </Gutter>
  )
} 