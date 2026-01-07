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
    <nav className="flex items-center gap-x-2 gap-y-0 flex-wrap">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        const colorClass = isLast 
          ? 'text-[var(--color-primary)]' 
          : 'text-[var(--text-breadcrumb)]'
        return (
          <React.Fragment key={index}>
            {index > 0 && <ChevronIcon />}
            <CMSLink
              url={item.href}
              label={item.label}
              className={colorClass}
              disabled={item.disabled}
            />
          </React.Fragment>
        )
      })}
    </nav>
  )
} 