import React from 'react'
import ChevronIcon from './chevron.svg'

export type BreadcrumbItem = {
  label: string
  href: string
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
            <span
              className={`${isLast ? 'text-[#EB6265]' : 'text-[#7F8186]'}`}
            >
              {item.label}
            </span>
          </React.Fragment>
        )
      })}
    </nav>
  )
} 