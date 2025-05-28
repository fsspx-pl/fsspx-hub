import { Gutter } from '@/_components/Gutter'
import { Media } from '@/_components/Media'
import { Media as MediaType } from '@/payload-types'
import React from 'react'
import { ArticleInfo } from '../../ArticleInfo'
import { garamond } from '@/fonts'

type Props = {
  title: string
  author?: string
  authorAvatar?: MediaType | null
  createdAt: string,
  updatedAt: string,
  image: MediaType
  className?: string
}

export const NewMediumImpact: React.FC<Props> = ({
  title,
  author,
  authorAvatar,
  createdAt,
  updatedAt,
  image,
  className,
}) => {
  return (
    <Gutter className={`${className} flex flex-col gap-4`}>
      <div className="relative h-[200px] md:h-[348px]">
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <Media 
            resource={image}
            fill
          />
        </div>
        <div className="relative h-full flex flex-col justify-end">
          <div className="prose prose-lg max-w-none bg-gradient-to-b from-transparent to-white to-70% pt-24">
            <h1 className={`${garamond.className} text-gray-700`}>
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