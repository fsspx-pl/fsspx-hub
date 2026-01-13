import type { Meta, StoryObj } from '@storybook/react'
import { Header as HeaderType, Settings } from '@/payload-types'
import React from 'react'
import { Gutter } from '../Gutter'
import { Logo } from '../Logo'
import { Menu } from './Menu'
import { HeaderNav } from './Nav'

// Client wrapper for Storybook since Header is an async Server Component
const HeaderWrapper: React.FC<{
  settings?: Settings | null
  navItems?: HeaderType['navItems']
}> = ({ settings, navItems }) => {
  if (!settings) return null

  return (
    <Gutter>
      <header className="flex flex-row justify-between items-center w-full py-4 lg:py-8 bg-white dark:bg-[#2B2B2B]">
        <Logo />
        <div className="hidden md:block">
          <HeaderNav navItems={navItems} />
        </div>
        <Menu
          copyright={settings.copyright}
          navItems={navItems}
        />
      </header>
    </Gutter>
  )
}

const mockSettings: Settings = {
  id: '1',
  logo: 'mock-logo-id',
  copyright: 'Parafia Świętego Krzyża',
}

const mockNavItems: HeaderType['navItems'] = [
  {
    link: {
      type: 'custom',
      url: '/ogloszenia',
      label: 'Ogłoszenia',
      newTab: false,
    },
  },
  {
    link: {
      type: 'custom',
      url: '/wydarzenia',
      label: 'Wydarzenia',
      newTab: false,
    },
  },
  {
    link: {
      type: 'custom',
      url: '/kontakt',
      label: 'Kontakt',
      newTab: false,
    },
  },
]

const meta = {
  title: 'Components/Header',
  component: HeaderWrapper,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HeaderWrapper>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    settings: mockSettings,
    navItems: mockNavItems,
  },
}
