import React from 'react'
import ChevronIcon from './chevron.svg'
import { CMSLink } from '../Link'

export type BreadcrumbItem = {
  label: string
  href?: string
  disabled?: boolean
}

type Props = {
  items: BreadcrumbItem[]
}

export const Breadcrumbs: React.FC<Props> = ({ items }) => {
  return (
    <nav className="flex items-center gap-2">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <React.Fragment key={index}>
            {index > 0 && <ChevronIcon />}
            <CMSLink
              url={item.href}
              label={item.label}
              className={`${isLast ? 'text-[#C81910]' : 'text-[#7F8186]'}`}
              disabled={item.disabled}
            />
          </React.Fragment>
        )
      })}
    </nav>
  )
} 