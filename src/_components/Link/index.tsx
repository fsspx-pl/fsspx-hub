import React from 'react'
import Link from 'next/link'

import { Button, Props as ButtonProps } from '../Button'
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
  appearance?: ButtonProps['appearance']
  children?: React.ReactNode
  className?: string
  invert?: ButtonProps['invert']
}

export const CMSLink: React.FC<CMSLinkType> = ({
  type,
  url,
  newTab,
  reference,
  label,
  appearance,
  children,
  className,
  invert,
}) => {
  const href =
    type === 'reference' && typeof reference?.value === 'object' && reference.value.slug
      ? `${reference?.relationTo !== 'pages' ? `/${reference?.relationTo}` : ''}/${
          reference.value.slug
        }`
      : url

  if (!href) return null

  if (!appearance) {
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

  if(!newTab) return null
  if(!label) return null

  return (
    <Button
      className={className}
      newTab={newTab}
      href={href}
      appearance={appearance}
      label={label}
      invert={invert}
    />
  )
}
