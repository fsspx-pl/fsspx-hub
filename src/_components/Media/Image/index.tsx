'use client'

import React from 'react'
import NextImage, { StaticImageData } from 'next/image'
import { Props as MediaProps } from '../types'
import classes from './index.module.scss'
import cssVariables from '@/utilities/cssVariables'
import { Media } from '@/payload-types'

const { breakpoints } = cssVariables

export const Image: React.FC<MediaProps> = props => {
  const {
    imgClassName,
    onClick,
    onLoad: onLoadFromProps,
    resource,
    priority,
    fill,
    alt: altFromProps,
  } = props

  const [isLoading, setIsLoading] = React.useState(true)

  let width: number | undefined
  let height: number | undefined
  let alt = altFromProps
  let src: StaticImageData | string = (resource as Media).url || ''

  if (!src && resource && typeof resource !== 'number') {
    const {
      width: fullWidth,
      height: fullHeight,
      alt: altFromResource,
    } = resource

    width = fullWidth ?? undefined
    height = fullHeight ?? undefined
    alt = altFromResource
  }

  // NOTE: this is used by the browser to determine which image to download at different screen sizes
  const sizes = Object.entries(breakpoints)
    .map(([, value]) => `(max-width: ${value}px) ${value}px`)
    .join(', ')

  return (
    <NextImage
      className={[
        isLoading && classes.placeholder,
        classes.image,
        imgClassName,
        'object-cover object-top',
      ]
        .filter(Boolean)
        .join(' ')}
      src={src}
      alt={alt || ''}
      onClick={onClick}
      onLoad={() => {
        setIsLoading(false)
        if (typeof onLoadFromProps === 'function') {
          onLoadFromProps()
        }
      }}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      sizes={sizes}
      priority={priority}
    />
  )
}
