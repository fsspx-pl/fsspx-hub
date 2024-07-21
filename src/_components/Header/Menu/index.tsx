'use client'

import { useState } from 'react'

import { Header, Media, Settings } from '../../../../payload/payload-types'
import { Logo } from '../../Logo'
import { MobileMenu } from '../MobileMenu'

export const Menu: React.FC<
  Pick<Settings, 'copyright' | 'logo'> & Pick<Header, 'textLogo' | 'navItems'>
> = ({ copyright, textLogo, logo, navItems }) => {
  const [mobileMenuActive, setMobileMenuActive] = useState(false)

  return (
    <>
      <button
        onClick={() => setMobileMenuActive(true)}
        className="md:hidden navbar-burger flex items-center p-3 relative top-2"
      >
        <svg
          className="block h-4 w-4 fill-current"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Mobile menu</title>
          <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
        </svg>
      </button>
      {mobileMenuActive && (
        <MobileMenu
          onClose={() => setMobileMenuActive(false)}
          copyright={copyright}
          navItems={navItems}
        >
          <Logo skipMainText logo={logo as Media} textLogo={textLogo as Media} />
        </MobileMenu>
      )}
    </>
  )
}
