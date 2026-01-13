'use client'

import React from 'react'

import { CMSLink } from '../../Link'
import { Header as HeaderType } from '@/payload-types'

export const HeaderNav: React.FC<Pick<HeaderType, 'navItems'>> = ({ navItems }) => {
  if(!navItems) return null

  return (
    <nav className="flex items-center gap-6">
      {navItems.map(({ link }, i) => {
        return <CMSLink key={i} {...link} />
      })}
    </nav>
  )
}
