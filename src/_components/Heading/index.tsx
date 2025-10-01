import React from 'react'
import { garamond } from '@/fonts'

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingTag
  children: React.ReactNode
  className?: string
}

const sizeByTag: Record<HeadingTag, string> = {
  h1: 'text-4xl',
  h2: 'text-3xl',
  h3: 'text-2xl',
  h4: 'text-xl',
  h5: 'text-lg',
  h6: 'text-base',
}

export function Heading({ as = 'h1', className, children, ...rest }: HeadingProps) {
  const Tag = as
  const base = `font-bold text-gray-700 ${sizeByTag[Tag]} ${garamond.className}`
  const composed = className ? `${base} ${className}` : base
  return (
    <Tag className={composed} {...rest}>
      {children}
    </Tag>
  )
}

export default Heading



