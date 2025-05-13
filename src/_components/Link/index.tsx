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
  disabled?: boolean
}

const ExternalLinkIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth="1.5" 
    stroke="currentColor" 
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" 
    />
  </svg>
)

export const CMSLink: React.FC<CMSLinkType> = ({
  type,
  url,
  newTab,
  reference,
  label,
  children,
  className,
  disabled,
}) => {
  const href =
    type === 'reference' && typeof reference?.value === 'object' && reference.value.slug
      ? `${reference?.relationTo !== 'pages' ? `/${reference?.relationTo}` : ''}/${
          reference.value.slug
        }`
      : url

  const newTabProps = newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {}
  return (
    <>
      { disabled && <span className={`no-underline ${className}`}>{label && label}</span> }
      { !disabled && <div className="items-center gap-1 relative w-fit block after:block after:content-[''] after:absolute after:bottom-[1px] after:h-[2px] after:bg-[#C81910] after:w-full after:scale-x-0 after:hover:scale-x-100 after:transition after:duration-300 after:origin-left">
        <Link {...newTabProps} href={href ?? ''} className={`no-underline ${className}`}>
        {label && label}
        {children && children}
      </Link>
      </div>
      }
      {newTab && (
        <ExternalLinkIcon className="w-4 h-4" />
      )}
    </>
  )
}
