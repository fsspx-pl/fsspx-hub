import Link from 'next/link'
import React from 'react'

import { Page } from '@/payload-types'

type CMSLinkType = {
  type?: 'custom' | 'reference' | null
  url?: string | null
  newTab?: boolean | null
  reference?: {
    value: string | Page
    relationTo: 'pages'
  } | null
  label?: string |  null
  children?: React.ReactNode
  className?: string
}

export const CMSLink: React.FC<CMSLinkType> = ({
  type,
  url,
  newTab,
  reference,
  label,
  children,
  className,
}) => {
  const href =
    type === 'reference' && typeof reference?.value === 'object' && reference.value.slug
      ? `${reference?.relationTo !== 'pages' ? `/${reference?.relationTo}` : ''}/${
          reference.value.slug
        }`
      : url

  if (!href) return null

  const newTabProps = newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {}

  if (href) {
    return (
      <Link {...newTabProps} href={href} className={className}>
        {label && label}
        {children && children}
      </Link>
    )
  }
}
