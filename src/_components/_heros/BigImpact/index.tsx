'use client'

import { Gutter } from '@/_components/Gutter'
import { Media } from '@/_components/Media'
import { garamond } from '@/fonts'
import { Media as MediaType } from '@/payload-types'
import React from 'react'
import { Gallery, Item } from 'react-photoswipe-gallery'
import 'photoswipe/dist/photoswipe.css'
import { ArticleInfo } from '../../ArticleInfo'
import { ReadingTime } from '../../ReadingTime'

type Props = {
  image: MediaType & { alt: string }
  images?: (MediaType & { alt: string })[]
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
  images,
  author,
  authorAvatar,
  createdAt,
  updatedAt,
  title,
  excerpt,
  readingTimeMinutes,
  now,
}) => {
  const galleryImages = images && images.length > 0 ? images : [image]

  return (
    <Gutter className="flex w-full gap-8 md:gap-16 flex-col md:flex-row">
        <Gallery options={{ showHideAnimationType: 'fade' }}>
          <div className="w-full h-36 md:h-72 md:flex-1 relative rounded-lg overflow-hidden">
            {galleryImages.map((img, index) => (
              <Item
                key={img.id || index}
                original={img.url || ''}
                thumbnail={img.url || ''}
                width={img.width || 1200}
                height={img.height || 800}
                alt={img.alt || ''}
              >
                {({ ref, open }) => (
                  <div 
                    ref={index === 0 ? ref : undefined} 
                    onClick={index === 0 ? open : undefined}
                    className={index === 0 ? 'w-full h-full cursor-pointer' : 'hidden'}
                  >
                    {index === 0 && (
                      <Media 
                        resource={img}
                        fill
                      />
                    )}
                  </div>
                )}
              </Item>
            ))}
          </div>
        </Gallery>
        <div className="flex-1 flex flex-col gap-4">
          <ArticleInfo
            author={author}
            avatar={authorAvatar}
            createdAt={createdAt}
            updatedAt={updatedAt}
          />
          <div className='prose'>
            <h1 className={`${garamond.className}`}>
              {title}
            </h1>
            <span className={`text-[#6A6C72] text-justify leading-relaxed`}>
              {excerpt}
            </span>
          </div>
          <ReadingTime minutes={readingTimeMinutes} />
        </div>
    </Gutter>
  )
} 