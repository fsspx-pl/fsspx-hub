import React, { Fragment } from 'react'

import { Image } from './Image'
import { Props } from './types'

export const Media: React.FC<Props> = props => {
  const { className, htmlElement = 'div' } = props

  const Tag = (htmlElement as any) || Fragment

  return (
    <Tag
      {...(htmlElement !== null
        ? {
            className,
          }
        : {})}
    >
      {/* eslint-disable jsx-a11y/alt-text */}
      <Image {...props} />
    </Tag>
  )
}
