'use client'

import { Gutter } from '@/_components/Gutter'
import { Media } from '@/_components/Media'
import { Media as MediaType } from '@/payload-types'
import React from 'react'
import { Gallery, Item } from 'react-photoswipe-gallery'
import 'photoswipe/dist/photoswipe.css'
import { ArticleInfo } from '../../ArticleInfo'
import { garamond } from '@/fonts'

type Props = {
  title: string
  author?: string
  authorAvatar?: MediaType | null
  createdAt: string,
  updatedAt: string,
  image: MediaType
  images?: MediaType[]
  className?: string
}

export const NewMediumImpact: React.FC<Props> = ({
  title,
  author,
  authorAvatar,
  createdAt,
  updatedAt,
  image,
  images,
  className,
}) => {
  const galleryImages = images && images.length > 0 ? images : [image]

  return (
    <Gutter className={`${className} flex flex-col gap-4`}>
      <div className="relative h-[200px] md:h-[348px]">
        <Gallery options={{
          showHideAnimationType: 'fade',
        }}>
          <div className="absolute inset-0 rounded-lg overflow-hidden z-0">
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
                    className={index === 0 ? 'w-full h-full absolute inset-0 cursor-pointer z-0' : 'hidden'}
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
        <div className="relative h-full flex flex-col justify-end pointer-events-none z-10">
          <div className="prose prose-lg max-w-none bg-gradient-to-b from-transparent to-[var(--bg-primary)] to-70% pt-24">
            <h1 className={`${garamond.className} text-[var(--text-primary)]`}>
              {title}
            </h1>
          </div>
        </div>
      </div>
      <ArticleInfo
        author={author}
        avatar={authorAvatar}
        createdAt={createdAt}
        updatedAt={updatedAt}
      />
    </Gutter>
  )
} 