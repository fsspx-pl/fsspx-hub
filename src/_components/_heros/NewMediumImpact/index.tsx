import React from 'react'
import { EB_Garamond } from 'next/font/google'
import { Gutter } from '@/_components/Gutter'
import { ArticleInfo } from '../../ArticleInfo'
import { Media } from '@/_components/Media'
import { Media as MediaType } from '@/payload-types'

const garamond = EB_Garamond({
  weight: '700',
  subsets: ['latin'],
})

type Props = {
  title: string
  author: string
  authorAvatar: MediaType | null
  timestamp: string
  image: MediaType
  className?: string
}

export const NewMediumImpact: React.FC<Props> = ({
  title,
  author,
  authorAvatar,
  timestamp,
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
          <div className="prose max-w-none bg-gradient-to-b from-transparent to-white to-40% pt-4">
            <h1 className={garamond.className}>
              {title}
            </h1>
          </div>
        </div>
      </div>
      <ArticleInfo
        author={author}
        avatar={authorAvatar}
        timestamp={timestamp}
      />
    </Gutter>
  )
} 