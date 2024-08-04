import React from 'react'

import { Gutter } from '@/_components/Gutter'
import { Media } from '@/_components/Media'
import { Media as MediaType } from '@/payload-types'

export const MediumImpactHero: React.FC<{ media: MediaType, title: string, subtitle: string }> = props => {
  const { media, title, subtitle } = props

  return (
    <div className="relative">
      {typeof media === 'object' && (
        <Media className="w-full opacity-20 h-32 overflow-hidden" resource={media} fill />
      )}
      <div className="absolute top-0 left-0 w-full h-full content-center">
        <Gutter>
          <div className="w-full py-4 lg:py-8 prose prose-headings:mb-0 prose-headings:font-medium">
            <h2>{title}</h2>
            <span>{subtitle}</span>
          </div>
        </Gutter>
      </div>
    </div>
  )
}
